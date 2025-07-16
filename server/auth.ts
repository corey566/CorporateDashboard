import { Request, Response, NextFunction } from "express";
import { userService, companyService, superAdminService } from "./saas-storage";
import { generateToken, verifyToken } from "./auth-utils";
import { db } from "./db";
import * as schema from "@shared/saas-schema";

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: schema.CompanyUser;
      company?: schema.Company;
      superAdmin?: schema.SuperAdmin;
      companyId?: number;
    }
  }
}

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded.user;
    req.company = decoded.company;
    req.companyId = decoded.companyId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to verify company access
export const requireCompanyAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.companyId) {
    return res.status(401).json({ error: 'Company access required' });
  }

  try {
    const company = await companyService.getCompanyById(req.companyId);
    if (!company || !company.isActive) {
      return res.status(404).json({ error: 'Company not found or inactive' });
    }

    req.company = company;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error verifying company access' });
  }
};

// Middleware to verify super admin access
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Super admin access required' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.superAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    req.superAdmin = decoded.superAdmin;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid super admin token' });
  }
};

// Middleware to check subscription limits
export const checkSubscriptionLimits = (resourceType: 'users' | 'agents' | 'admins') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.companyId) {
      return res.status(401).json({ error: 'Company access required' });
    }

    try {
      const subscription = await db
        .select()
        .from(schema.companySubscriptions)
        .where(
          schema.companySubscriptions.companyId.eq(req.companyId)
        )
        .limit(1);

      if (!subscription[0]) {
        return res.status(403).json({ error: 'No active subscription' });
      }

      const plan = await db
        .select()
        .from(schema.subscriptionPlans)
        .where(
          schema.subscriptionPlans.id.eq(subscription[0].planId)
        )
        .limit(1);

      if (!plan[0]) {
        return res.status(403).json({ error: 'Subscription plan not found' });
      }

      const currentCount = subscription[0][`current${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}` as keyof typeof subscription[0]] as number;
      const maxCount = plan[0][`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}` as keyof typeof plan[0]] as number;

      if (currentCount >= maxCount) {
        return res.status(403).json({ 
          error: `${resourceType} limit exceeded. Current: ${currentCount}, Max: ${maxCount}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error checking subscription limits' });
    }
  };
};

// Auth helper functions
export const generateAuthToken = (user: schema.CompanyUser, company: schema.Company): string => {
  return generateToken({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    company: {
      id: company.id,
      name: company.name,
      companyId: company.companyId,
    },
    companyId: company.id,
  });
};

export const generateSuperAdminToken = (admin: schema.SuperAdmin): string => {
  return generateToken({
    superAdmin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
};

// Session-based authentication for backward compatibility
export const sessionAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check for session-based authentication for existing routes
  if (req.session && req.session.user) {
    next();
  } else {
    // Try JWT authentication
    authenticateToken(req, res, next);
  }
};

// Rate limiting for authentication routes
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50; // Increased for development

  const attempts = authAttempts.get(clientId);
  
  if (attempts) {
    // Reset if window expired
    if (now - attempts.lastAttempt > windowMs) {
      authAttempts.delete(clientId);
    } else if (attempts.count >= maxAttempts) {
      return res.status(429).json({
        error: 'Too many authentication attempts. Please try again later.',
      });
    }
  }

  // Record this attempt
  const currentAttempts = attempts ? attempts.count + 1 : 1;
  authAttempts.set(clientId, {
    count: currentAttempts,
    lastAttempt: now,
  });

  next();
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};