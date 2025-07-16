import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import nodemailer from 'nodemailer';

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
export function generateToken(payload: any, expiresIn: string = '7d'): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.verify(token, secret);
}

// OTP utilities
export function generateOTPSecret(): string {
  return authenticator.generateSecret();
}

export function generateOTP(secret: string): string {
  return authenticator.generate(secret);
}

export function verifyOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

// Generate random tokens
export function generateRandomToken(): string {
  return randomBytes(32).toString('hex');
}

// Generate unique company ID
export function generateCompanyId(): string {
  return 'CMP-' + randomBytes(8).toString('hex').toUpperCase();
}

// Generate connection string
export function generateConnectionString(): string {
  return 'CONN-' + randomBytes(16).toString('hex').toUpperCase();
}

// Email service
export class EmailService {
  private transporter: nodemailer.Transporter;
  private smtpConfig: any = {};

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Load SMTP settings from database
      const { db } = await import('./db');
      const { systemSettings } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const smtpSettings = await db.select().from(systemSettings);
      for (const setting of smtpSettings) {
        if (setting.key.startsWith('smtp_')) {
          this.smtpConfig[setting.key] = setting.value;
        }
      }
      
      // Configure with database settings or fallback
      const smtpHost = this.smtpConfig.smtp_host || 'smtppro.zoho.com';
      const smtpPort = parseInt(this.smtpConfig.smtp_port || '465');
      const smtpUser = this.smtpConfig.smtp_username || 'noreply@codestudio.lk';
      const smtpPass = this.smtpConfig.smtp_password || 'Fyh4xTDFieGr';
      const smtpEncryption = this.smtpConfig.smtp_encryption || 'ssl';
      
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpEncryption === 'ssl',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    } catch (error) {
      console.error('Error initializing email service:', error);
      // Fallback to default configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.com',
        port: 465,
        secure: true,
        auth: {
          user: 'noreply@codestudio.lk',
          pass: 'Fyh4xTDFieGr'
        }
      });
    }
  }

  async refreshConfiguration() {
    await this.initializeTransporter();
  }

  async sendWelcomeEmail(email: string, name: string, companyName: string): Promise<void> {
    const subject = `Welcome to Sales Dashboard - ${companyName}`;
    const html = `
      <h2>Welcome to Sales Dashboard!</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created successfully for ${companyName}.</p>
      <p>You can now access your dashboard and start managing your sales team.</p>
      <p>Best regards,<br>Sales Dashboard Team</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@salesdashboard.com',
      to: email,
      subject,
      html,
    });
  }

  async sendEmailVerification(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const subject = 'Verify Your Email Address';
    const html = `
      <h2>Email Verification</h2>
      <p>Hi ${name},</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If the link doesn't work, copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>Sales Dashboard Team</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@salesdashboard.com',
      to: email,
      subject,
      html,
    });
  }

  async sendOTPEmail(email: string, name: string, otp: string): Promise<void> {
    const subject = 'Your Login OTP Code';
    const html = `
      <h2>Login Verification</h2>
      <p>Hi ${name},</p>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p>Best regards,<br>Sales Dashboard Team</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@salesdashboard.com',
      to: email,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const html = `
      <h2>Password Reset</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If the link doesn't work, copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Best regards,<br>Sales Dashboard Team</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@salesdashboard.com',
      to: email,
      subject,
      html,
    });
  }

  async sendAgentInvitation(email: string, agentName: string, companyName: string, tempPassword: string): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL}/agent-login`;
    const subject = `Welcome to ${companyName} - Sales Dashboard`;
    const html = `
      <h2>Welcome to ${companyName}!</h2>
      <p>Hi ${agentName},</p>
      <p>You've been invited to join ${companyName}'s sales team on our dashboard.</p>
      <p>Your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p><a href="${loginUrl}">Login to Dashboard</a></p>
      <p>Please change your password after your first login.</p>
      <p>Best regards,<br>${companyName} Team</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@salesdashboard.com',
      to: email,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();