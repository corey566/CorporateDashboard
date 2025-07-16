import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { authenticateToken, requireCompanyAccess, requireSuperAdmin, authRateLimit, generateAuthToken, generateSuperAdminToken } from "./auth";
import { storage } from "./storage";
import { insertSaleSchema, insertAgentSchema, insertTeamSchema, insertCashOfferSchema, insertMediaSlideSchema, insertAnnouncementSchema, insertNewsTickerSchema, agentLoginSchema, insertFileUploadSchema, insertSystemSettingSchema, insertSoundEffectSchema } from "@shared/schema";
import { userService, companyService, superAdminService, subscriptionService, paymentService, getTenantService } from "./saas-storage";
import { payHereService } from "./payhere-service";
import { emailService } from "./auth-utils";
import * as saasSchema from "@shared/saas-schema";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import multer from "multer";
import path from "path";
import fs from "fs";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

interface WebSocketMessage {
  type: string;
  data?: any;
}

let wss: WebSocketServer;

function broadcastToClients(message: WebSocketMessage) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: (req, file, cb) => {
    // Allow images and audio files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export function registerRoutes(app: Express): Server {
  // SAAS Authentication Routes
  app.use('/api/auth', authRateLimit);
  
  // User Registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, companyName, planId } = saasSchema.registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Create company
      const company = await companyService.createCompany({
        name: companyName,
        email: email,
        subdomain: companyName.toLowerCase().replace(/\s+/g, '-'),
      });
      
      // Create user
      const user = await userService.createCompanyUser({
        companyId: company.id,
        name,
        email,
        password,
        role: 'admin',
      });
      
      // Create subscription if planId provided
      if (planId) {
        await subscriptionService.createCompanySubscription(company.id, planId, 'monthly');
      }
      
      // Send welcome email
      await emailService.sendWelcomeEmail(email, name, companyName);
      
      const token = generateAuthToken(user, company);
      res.status(201).json({ user, company, token });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Registration failed', details: error.message });
    }
  });
  
  // User Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = saasSchema.loginSchema.parse(req.body);
      
      const user = await userService.verifyUserPassword(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const company = await companyService.getCompanyById(user.companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      const token = generateAuthToken(user, company);
      res.json({ user, company, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ error: 'Login failed', details: error.message });
    }
  });
  
  // Super Admin Login
  app.post('/api/auth/superadmin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const admin = await superAdminService.verifySuperAdminPassword(email, password);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = generateSuperAdminToken(admin);
      res.json({ admin, token });
    } catch (error) {
      console.error('Super admin login error:', error);
      res.status(400).json({ error: 'Login failed', details: error.message });
    }
  });
  
  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    res.json({ user: req.user, company: req.company });
  });
  
  // Super Admin Dashboard Routes
  app.get('/api/superadmin/companies', requireSuperAdmin, async (req, res) => {
    try {
      const companies = await superAdminService.getAllCompaniesWithStats();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  });
  
  // Payment Routes
  app.post('/api/payment/create', authenticateToken, requireCompanyAccess, async (req, res) => {
    try {
      const { planId, billingInterval } = req.body;
      
      const subscription = await subscriptionService.createCompanySubscription(
        req.companyId!,
        planId,
        billingInterval
      );
      
      const payment = payHereService.createPayment({
        companyId: req.companyId!,
        subscriptionId: subscription.id,
        amount: 1000, // This should come from plan pricing
        currency: 'LKR',
        description: 'Sales Dashboard Subscription',
        customerName: req.user!.name,
        customerEmail: req.user!.email,
        customerPhone: req.company!.phone || '+94123456789',
        customerAddress: req.company!.address || 'Colombo',
        customerCity: 'Colombo',
      });
      
      res.json({ payment });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });
  
  // PayHere notification handler
  app.post('/api/payment/payhere/notify', async (req, res) => {
    try {
      const notification = req.body;
      
      if (payHereService.verifyPayment(notification)) {
        const status = payHereService.isPaymentSuccessful(notification.status_code) ? 'completed' : 'failed';
        await paymentService.updatePaymentStatus(notification.order_id, status, notification);
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('PayHere notification error:', error);
      res.status(500).send('Error');
    }
  });
  
  // Multi-tenant Company Dashboard Routes
  app.get('/api/company/dashboard', authenticateToken, requireCompanyAccess, async (req, res) => {
    try {
      const tenantService = getTenantService(req.companyId!);
      const data = await tenantService.getDashboardData();
      res.json(data);
    } catch (error) {
      console.error('Company dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

  // Dashboard data endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const data = await storage.getDashboardData();
      res.json(data);
    } catch (error) {
      console.error("Dashboard data error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data", details: error.message });
    }
  });

  // Agents endpoints
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Create a server-side schema that handles string-to-number conversion
      const serverAgentSchema = insertAgentSchema.extend({
        teamId: z.union([z.number(), z.string().transform(val => parseInt(val))]),
        volumeTarget: z.union([z.number(), z.string().transform(val => parseFloat(val))]),
        unitsTarget: z.union([z.number(), z.string().transform(val => parseInt(val))]),
      });
      
      const agentData = serverAgentSchema.parse(req.body);
      
      // Hash password if provided
      if (agentData.password) {
        agentData.password = await hashPassword(agentData.password);
      }
      
      const agent = await storage.createAgent(agentData);
      
      // Broadcast update to all connected clients
      broadcastToClients({ type: "agent_created", data: agent });
      
      res.status(201).json(agent);
    } catch (error) {
      console.error("Agent creation error:", error);
      res.status(400).json({ 
        error: "Invalid agent data",
        details: error instanceof z.ZodError ? error.errors : error.message 
      });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      
      // Create a server-side schema that handles string-to-number conversion  
      const serverAgentSchema = insertAgentSchema.extend({
        teamId: z.union([z.number(), z.string().transform(val => parseInt(val))]),
        volumeTarget: z.union([z.number(), z.string().transform(val => parseFloat(val))]),
        unitsTarget: z.union([z.number(), z.string().transform(val => parseInt(val))]),
      }).partial();
      
      const agentData = serverAgentSchema.parse(req.body);
      
      // Hash password if provided
      if (agentData.password) {
        agentData.password = await hashPassword(agentData.password);
      }
      
      const agent = await storage.updateAgent(id, agentData);
      
      broadcastToClients({ type: "agent_updated", data: agent });
      
      res.json(agent);
    } catch (error) {
      console.error("Agent update error:", error);
      res.status(400).json({ 
        error: "Failed to update agent",
        details: error instanceof z.ZodError ? error.errors : error.message 
      });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAgent(id);
      
      broadcastToClients({ type: "agent_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  // Teams endpoints
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData);
      
      broadcastToClients({ type: "team_created", data: team });
      
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ error: "Invalid team data" });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      console.log("Team update request body:", req.body);
      
      // Convert values to appropriate types - volumeTarget should be string for decimal
      const processedData = {
        ...req.body,
        volumeTarget: req.body.volumeTarget ? req.body.volumeTarget.toString() : "0",
        unitsTarget: req.body.unitsTarget ? parseInt(req.body.unitsTarget) : 0,
      };
      
      console.log("Processed team data:", processedData);
      const teamData = insertTeamSchema.parse(processedData);
      const team = await storage.updateTeam(id, teamData);
      
      broadcastToClients({ type: "team_updated", data: team });
      
      res.json(team);
    } catch (error) {
      console.error("Team update error:", error);
      res.status(400).json({ error: "Invalid team data", details: error.message });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeam(id);
      
      broadcastToClients({ type: "team_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

  // Sales endpoints
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      
      // Broadcast real-time sale update
      broadcastToClients({ type: "sale_created", data: sale });
      
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ error: "Invalid sale data" });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.updateSale(id, saleData);
      
      // Broadcast real-time sale update
      broadcastToClients({ type: "sale_updated", data: sale });
      
      res.json(sale);
    } catch (error) {
      res.status(400).json({ error: "Invalid sale data" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSale(id);
      
      // Broadcast real-time sale update
      broadcastToClients({ type: "sale_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sale" });
    }
  });

  // Cash offers endpoints
  app.get("/api/cash-offers", async (req, res) => {
    try {
      const offers = await storage.getActiveCashOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cash offers" });
    }
  });

  app.post("/api/cash-offers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Transform the request body to match the schema
      const transformedData = {
        title: req.body.title,
        description: req.body.description,
        reward: (req.body.amount || req.body.reward || 0).toString(),
        type: req.body.type || 'volume',
        target: (req.body.targetSales || req.body.target || 0).toString(),
        expiresAt: new Date(req.body.expiresAt)
      };
      
      const offerData = insertCashOfferSchema.parse(transformedData);
      const offer = await storage.createCashOffer(offerData);
      
      broadcastToClients({ type: "cash_offer_created", data: offer });
      
      res.status(201).json(offer);
    } catch (error) {
      console.error("Cash offer creation error:", error);
      res.status(400).json({ 
        error: "Invalid cash offer data",
        details: error instanceof z.ZodError ? error.errors : error.message 
      });
    }
  });

  app.put("/api/cash-offers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const transformedData = {
        title: req.body.title,
        description: req.body.description,
        reward: (req.body.amount || req.body.reward || 0).toString(),
        type: req.body.type || 'volume',
        target: (req.body.targetSales || req.body.target || 0).toString(),
        expiresAt: new Date(req.body.expiresAt)
      };
      
      const offerData = insertCashOfferSchema.parse(transformedData);
      const offer = await storage.updateCashOffer(id, offerData);
      
      broadcastToClients({ type: "cash_offer_updated", data: offer });
      
      res.json(offer);
    } catch (error) {
      res.status(400).json({ error: "Invalid cash offer data" });
    }
  });

  app.delete("/api/cash-offers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCashOffer(id);
      
      broadcastToClients({ type: "cash_offer_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cash offer" });
    }
  });

  // Media slides endpoints
  app.get("/api/media-slides", async (req, res) => {
    try {
      const slides = await storage.getActiveMediaSlides();
      res.json(slides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media slides" });
    }
  });

  app.post("/api/media-slides", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const slideData = insertMediaSlideSchema.parse(req.body);
      const slide = await storage.createMediaSlide(slideData);
      
      broadcastToClients({ type: "media_slide_created", data: slide });
      
      res.status(201).json(slide);
    } catch (error) {
      res.status(400).json({ error: "Invalid media slide data" });
    }
  });

  app.put("/api/media-slides/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const slideData = insertMediaSlideSchema.parse(req.body);
      const slide = await storage.updateMediaSlide(id, slideData);
      
      broadcastToClients({ type: "media_slide_updated", data: slide });
      
      res.json(slide);
    } catch (error) {
      res.status(400).json({ error: "Invalid media slide data" });
    }
  });

  app.delete("/api/media-slides/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMediaSlide(id);
      
      broadcastToClients({ type: "media_slide_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete media slide" });
    }
  });

  // Announcements endpoints
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(announcementData);
      
      broadcastToClients({ type: "announcement_created", data: announcement });
      
      res.status(201).json(announcement);
    } catch (error) {
      res.status(400).json({ error: "Invalid announcement data" });
    }
  });

  app.put("/api/announcements/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.updateAnnouncement(id, announcementData);
      
      broadcastToClients({ type: "announcement_updated", data: announcement });
      
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: "Invalid announcement data" });
    }
  });

  app.delete("/api/announcements/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      
      broadcastToClients({ type: "announcement_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  // News ticker endpoints
  app.get("/api/news-ticker", async (req, res) => {
    try {
      const ticker = await storage.getActiveNewsTicker();
      res.json(ticker);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news ticker" });
    }
  });

  app.post("/api/news-ticker", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tickerData = insertNewsTickerSchema.parse(req.body);
      const ticker = await storage.createNewsTicker(tickerData);
      
      broadcastToClients({ type: "news_ticker_created", data: ticker });
      
      res.status(201).json(ticker);
    } catch (error) {
      res.status(400).json({ error: "Invalid news ticker data" });
    }
  });

  app.put("/api/news-ticker/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const tickerData = insertNewsTickerSchema.parse(req.body);
      const ticker = await storage.updateNewsTicker(id, tickerData);
      
      broadcastToClients({ type: "news_ticker_updated", data: ticker });
      
      res.json(ticker);
    } catch (error) {
      res.status(400).json({ error: "Invalid news ticker data" });
    }
  });

  app.delete("/api/news-ticker/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNewsTicker(id);
      
      broadcastToClients({ type: "news_ticker_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete news ticker" });
    }
  });

  // Mobile agent authentication endpoints
  app.post("/api/mobile/login", async (req, res) => {
    try {
      const { username, password } = agentLoginSchema.parse(req.body);
      
      const agent = await storage.getAgentByUsername(username);
      if (!agent || !agent.password || !agent.canSelfReport) {
        return res.status(401).json({ error: "Invalid credentials or access denied" });
      }
      
      const isValid = await comparePasswords(password, agent.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set mobile session
      req.session.agentId = agent.id;
      
      // Return agent data (excluding password)
      const { password: _, ...agentData } = agent;
      res.json(agentData);
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/mobile/logout", async (req, res) => {
    req.session.agentId = null;
    res.sendStatus(200);
  });

  app.get("/api/mobile/agent", async (req, res) => {
    if (!req.session.agentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const agent = await storage.getAgent(req.session.agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      // Return agent data (excluding password)
      const { password: _, ...agentData } = agent;
      res.json(agentData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent data" });
    }
  });

  app.get("/api/mobile/sales", async (req, res) => {
    if (!req.session.agentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const sales = await storage.getSalesByAgent(req.session.agentId);
      res.json({ sales });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales data" });
    }
  });

  app.post("/api/mobile/sales", async (req, res) => {
    if (!req.session.agentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const agent = await storage.getAgent(req.session.agentId);
      if (!agent || !agent.canSelfReport) {
        return res.status(403).json({ error: "Self-reporting not allowed" });
      }
      
      const saleData = insertSaleSchema.parse({
        ...req.body,
        agentId: req.session.agentId
      });
      
      const sale = await storage.createSale(saleData);
      
      // Broadcast real-time sale update
      broadcastToClients({ type: "sale_created", data: sale });
      
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ error: "Invalid sale data" });
    }
  });

  // System settings endpoints
  app.get("/api/system-settings", async (req, res) => {
    // Allow unauthenticated access for backward compatibility
    
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });

  app.get("/api/system-settings/:key", async (req, res) => {
    // Allow unauthenticated access for backward compatibility
    
    try {
      const setting = await storage.getSystemSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system setting" });
    }
  });

  app.post("/api/system-settings", async (req, res) => {
    // Allow unauthenticated access for backward compatibility
    
    try {
      const settingData = insertSystemSettingSchema.parse(req.body);
      const setting = await storage.createSystemSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      res.status(400).json({ error: "Invalid system setting data" });
    }
  });

  app.put("/api/system-settings/:key", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { value } = req.body;
      const setting = await storage.updateSystemSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: "Failed to update system setting" });
    }
  });

  app.delete("/api/system-settings/:key", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.deleteSystemSetting(req.params.key);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete system setting" });
    }
  });

  // Sound effects endpoints
  app.get("/api/sound-effects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const soundEffects = await storage.getSoundEffects();
      res.json(soundEffects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sound effects" });
    }
  });

  app.get("/api/sound-effects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const soundEffect = await storage.getSoundEffect(parseInt(req.params.id));
      if (!soundEffect) {
        return res.status(404).json({ error: "Sound effect not found" });
      }
      res.json(soundEffect);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sound effect" });
    }
  });

  app.get("/api/sound-effects/event/:eventType", async (req, res) => {
    // No authentication required for TV dashboard sound playback
    try {
      const soundEffect = await storage.getSoundEffectByEventType(req.params.eventType);
      if (!soundEffect) {
        return res.status(404).json({ error: "Sound effect not found for event type" });
      }
      res.json(soundEffect);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sound effect" });
    }
  });

  app.post("/api/sound-effects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const soundEffectData = insertSoundEffectSchema.parse(req.body);
      const soundEffect = await storage.createSoundEffect(soundEffectData);
      
      // Broadcast real-time update
      broadcastToClients({ type: "sound_effect_created", data: soundEffect });
      
      res.status(201).json(soundEffect);
    } catch (error) {
      res.status(400).json({ error: "Invalid sound effect data" });
    }
  });

  app.put("/api/sound-effects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const soundEffectData = insertSoundEffectSchema.partial().parse(req.body);
      const soundEffect = await storage.updateSoundEffect(id, soundEffectData);
      
      // Broadcast real-time update
      broadcastToClients({ type: "sound_effect_updated", data: soundEffect });
      
      res.json(soundEffect);
    } catch (error) {
      res.status(400).json({ error: "Failed to update sound effect" });
    }
  });

  app.delete("/api/sound-effects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSoundEffect(id);
      
      // Broadcast real-time update
      broadcastToClients({ type: "sound_effect_deleted", data: { id } });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sound effect" });
    }
  });

  // File upload endpoints
  app.get("/api/files", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const files = await storage.getFileUploads();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.post("/api/files", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileData = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'audio'
      };
      
      const file = await storage.createFileUpload(fileData);
      res.status(201).json(file);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const fileId = parseInt(req.params.id);
      await storage.deleteFileUpload(fileId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Reports endpoints
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { startDate, endDate, agentId, teamId, reportType } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const reportData = await storage.generateReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        agentId: agentId ? parseInt(agentId as string) : undefined,
        teamId: teamId ? parseInt(teamId as string) : undefined,
        reportType: reportType as string || "sales"
      });

      res.json(reportData);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.post("/api/reports/export", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { startDate, endDate, agentId, teamId, reportType, format } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const reportData = await storage.generateReport({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        agentId: agentId ? parseInt(agentId) : undefined,
        teamId: teamId ? parseInt(teamId) : undefined,
        reportType: reportType || "sales"
      });

      if (format === "csv") {
        const csv = await storage.exportReportAsCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="sales-report-${startDate}-to-${endDate}.csv"`);
        res.send(csv);
      } else if (format === "excel") {
        const excel = await storage.exportReportAsExcel(reportData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="sales-report-${startDate}-to-${endDate}.xlsx"`);
        res.send(excel);
      } else if (format === "pdf") {
        const pdf = await storage.exportReportAsPDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="sales-report-${startDate}-to-${endDate}.pdf"`);
        res.send(pdf);
      } else {
        res.status(400).json({ error: "Invalid format. Use csv, excel, or pdf" });
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      res.status(500).json({ error: "Failed to export report" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
