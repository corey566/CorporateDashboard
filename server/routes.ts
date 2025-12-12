import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { registerRoutes as registerAuthRoutes } from "./auth";
import { storage } from "./storage";
import { insertSaleSchema, insertAgentSchema, insertTeamSchema, insertCashOfferSchema, insertMediaSlideSchema, insertAnnouncementSchema, insertNewsTickerSchema, agentLoginSchema, insertAgentCategoryTargetSchema, insertTeamCategoryTargetSchema, insertCategorySchema, insertSystemSettingSchema, insertSoundEffectSchema, insertFileUploadSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import multer from "multer";
import path from "path";
import fs from "fs";
import { isSetupComplete, runSetup } from "./setup";
import { domainConfigService } from "./domain-config";

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

// Object Storage Service
let objectStorageService: any = null;
const initObjectStorage = async () => {
  try {
    const { ObjectStorageService } = await import("./objectStorage");
    objectStorageService = new ObjectStorageService();
    console.log("Object storage initialized successfully");
  } catch (error) {
    console.log("Object storage not available, falling back to local uploads:", error.message);
  }
};

// Initialize object storage
initObjectStorage();

// Setup check middleware
async function setupCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  // Allow setup and static routes
  if (req.path.startsWith('/api/setup') || req.path === '/setup' || req.path.startsWith('/assets')) {
    return next();
  }

  const setupComplete = await isSetupComplete();

  if (!setupComplete && !req.path.includes('setup')) {
    return res.redirect('/setup');
  }

  next();
}

export function registerRoutes(app: Express): Server {
  // Setup routes (before auth check)
  app.get('/api/setup/status', async (req, res) => {
    try {
      const complete = await isSetupComplete();
      res.json({ complete });
    } catch (error: any) {
      res.json({ complete: false, error: error.message });
    }
  });

  app.post('/api/setup', async (req, res) => {
    try {
      const setupComplete = await isSetupComplete();

      if (setupComplete) {
        return res.status(400).json({ 
          success: false, 
          error: 'Setup already completed' 
        });
      }

      const result = await runSetup(req.body);
      res.json(result);

      // Restart server after successful setup
      if (result.success) {
        setTimeout(() => {
          process.exit(0); // PM2 or systemd will restart
        }, 2000);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Domain configuration endpoints
  app.post('/api/domain/configure', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { domain, enableSSL = true } = req.body;
      
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }

      const port = parseInt(process.env.ACTUAL_PORT || process.env.PORT || '5000');
      
      const result = await domainConfigService.configureDomain({
        domain,
        port,
        enableSSL
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/domain/status', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const domain = process.env.APP_DOMAIN;
      
      if (!domain) {
        return res.json({ configured: false, domain: null });
      }

      const status = await domainConfigService.checkDomainStatus(domain);
      
      res.json({
        ...status,
        domain,
        port: process.env.ACTUAL_PORT || process.env.PORT
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply setup check to all routes
  app.use(setupCheckMiddleware);

  // Setup authentication routes
  registerAuthRoutes(app);

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
      res.status(500).json({ error: "Failed to fetch dashboard data", details: error instanceof Error ? error.message : String(error) });
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
      console.log("Agent creation request body:", req.body);

      // Create a flexible server-side schema that handles string-to-number conversion
      const serverAgentSchema = insertAgentSchema.extend({
        teamId: z.union([z.number(), z.string().transform(val => parseInt(val))]),
        categoryId: z.union([z.number(), z.string().transform(val => parseInt(val))]).optional(),
        volumeTarget: z.union([z.number(), z.string().transform(val => parseFloat(val))]),
        unitsTarget: z.union([z.number(), z.string().transform(val => parseInt(val))]),
        isActive: z.boolean().optional().default(true),
        canSelfReport: z.boolean().optional().default(false),
        username: z.string().optional(),
        password: z.string().optional(),
      });

      const agentData = serverAgentSchema.parse(req.body);
      console.log("Parsed agent data:", agentData);

      // Hash password if provided
      if (agentData.password) {
        agentData.password = await hashPassword(agentData.password);
      }

      const agent = await storage.createAgent({
        ...agentData,
        volumeTarget: agentData.volumeTarget.toString(),
        unitsTarget: agentData.unitsTarget
      });

      // Broadcast update to all connected clients
      broadcastToClients({ type: "agent_created", data: agent });

      res.status(201).json(agent);
    } catch (error) {
      console.error("Agent creation error:", error);
      res.status(400).json({ 
        error: "Invalid agent data",
        details: error instanceof z.ZodError ? error.errors : (error instanceof Error ? error.message : String(error)) 
      });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      console.log("Agent update request body:", req.body);

      // Create a flexible server-side schema that handles string-to-number conversion  
      const serverAgentSchema = insertAgentSchema.extend({
        teamId: z.union([z.number(), z.string().transform(val => parseInt(val))]).optional(),
        categoryId: z.union([z.number(), z.string().transform(val => parseInt(val))]).optional(),
        volumeTarget: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
        unitsTarget: z.union([z.number(), z.string().transform(val => parseInt(val))]).optional(),
        isActive: z.boolean().optional(),
        canSelfReport: z.boolean().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        name: z.string().optional(),
        photo: z.string().optional(),
        category: z.string().optional(),
        targetCycle: z.string().optional(),
        resetDay: z.number().optional(),
        resetMonth: z.number().optional(),
      }).partial();

      const agentData = serverAgentSchema.parse(req.body);
      console.log("Parsed agent data:", agentData);

      // Hash password if provided
      if (agentData.password) {
        agentData.password = await hashPassword(agentData.password);
      }

      const agent = await storage.updateAgent(id, {
        ...agentData,
        volumeTarget: agentData.volumeTarget ? agentData.volumeTarget.toString() : undefined
      });

      broadcastToClients({ type: "agent_updated", data: agent });

      res.json(agent);
    } catch (error) {
      console.error("Agent update error:", error);
      res.status(400).json({ 
        error: "Failed to update agent",
        details: error instanceof z.ZodError ? error.errors : (error instanceof Error ? error.message : String(error))
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
      console.log("Team creation request body:", req.body);

      // Process and set defaults for undefined values
      const processedData = {
        ...req.body,
        volumeTarget: req.body.volumeTarget !== undefined ? req.body.volumeTarget.toString() : "0",
        unitsTarget: req.body.unitsTarget !== undefined ? parseInt(req.body.unitsTarget) : 0,
        resetDay: req.body.resetDay !== undefined ? parseInt(req.body.resetDay) : 1,
        resetMonth: req.body.resetMonth !== undefined ? parseInt(req.body.resetMonth) : 1,
      };

      console.log("Processed team data before validation:", processedData);

      // Create a server-side schema that handles string-to-number conversion
      const serverTeamSchema = insertTeamSchema.extend({
        volumeTarget: z.union([z.number(), z.string().transform(val => parseFloat(val))]),
        unitsTarget: z.union([z.number(), z.string().transform(val => parseInt(val))]),
        resetDay: z.union([z.number(), z.string().transform(val => parseInt(val))]),
        resetMonth: z.union([z.number(), z.string().transform(val => parseInt(val))]).optional(),
      });

      const teamData = serverTeamSchema.parse(processedData);
      console.log("Parsed team data:", teamData);

      const team = await storage.createTeam({
        ...teamData,
        volumeTarget: teamData.volumeTarget.toString()
      });

      broadcastToClients({ type: "team_created", data: team });

      res.status(201).json(team);
    } catch (error) {
      console.error("Team creation error:", error);
      res.status(400).json({ 
        error: "Invalid team data",
        details: error instanceof z.ZodError ? error.errors : (error instanceof Error ? error.message : String(error))
      });
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
      res.status(400).json({ error: "Invalid team data", details: error instanceof Error ? error.message : String(error) });
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
      res.status(500).json({ error: "Failed to delete team", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      console.log("Category creation request body:", req.body);
      const categoryData = insertCategorySchema.parse(req.body);
      console.log("Parsed category data:", categoryData);

      const category = await storage.createCategory(categoryData);

      broadcastToClients({ type: "category_created", data: category });

      res.status(201).json(category);
    } catch (error) {
      console.error("Category creation error:", error);
      res.status(400).json({ 
        error: "Invalid category data",
        details: error instanceof z.ZodError ? error.errors : (error instanceof Error ? error.message : String(error))
      });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      console.log("Category update request body:", req.body);

      const categoryData = insertCategorySchema.partial().parse(req.body);
      console.log("Parsed category data:", categoryData);

      const category = await storage.updateCategory(id, categoryData);

      broadcastToClients({ type: "category_updated", data: category });

      res.json(category);
    } catch (error) {
      console.error("Category update error:", error);
      res.status(400).json({ 
        error: "Invalid category data", 
        details: error instanceof z.ZodError ? error.errors : (error instanceof Error ? error.message : String(error))
      });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      console.log("Category delete request for ID:", id);

      await storage.deleteCategory(id);

      broadcastToClients({ type: "category_deleted", data: { id } });

      res.sendStatus(204);
    } catch (error) {
      console.error("Category delete error:", error);
      res.status(500).json({ 
        error: "Failed to delete category",
        details: error instanceof Error ? error.message : String(error)
      });
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
      console.log("Sale creation request body:", req.body);

      // Parse date strings to Date objects for cycle dates
      const requestData = {
        ...req.body,
        cycleStartDate: new Date(req.body.cycleStartDate),
        cycleEndDate: new Date(req.body.cycleEndDate),
      };

      console.log("Request data with parsed dates:", requestData);
      const saleData = insertSaleSchema.parse(requestData);
      console.log("Parsed sale data:", saleData);
      const sale = await storage.createSale(saleData);
      console.log("Created sale:", sale);

      // Broadcast real-time sale update
      console.log("Broadcasting sale_created event to clients");
      broadcastToClients({ type: "sale_created", data: sale });

      res.status(201).json(sale);
    } catch (error) {
      console.error("Sale creation error:", error);
      res.status(400).json({ error: "Invalid sale data", details: error instanceof Error ? error.message : String(error) });
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
      res.status(400).json({ error: "Invalid sale data", details: error instanceof Error ? error.message : String(error) });
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
        details: error instanceof z.ZodError ? error.errors : (error instanceof Error ? error.message : String(error)) 
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
      res.status(400).json({ error: "Invalid cash offer data", details: error instanceof Error ? error.message : String(error) });
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
    req.session.agentId = undefined;
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
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });

  // Public currency settings endpoint (no authentication required)
  app.get("/api/currency-settings", async (req, res) => {
    try {
      const currencySettings = await storage.getCurrencySettings();
      res.json(currencySettings);
    } catch (error) {
      console.error("Currency settings error:", error);
      res.status(500).json({ error: "Failed to fetch currency settings" });
    }
  });

  app.get("/api/system-settings/:key", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

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
    if (!req.isAuthenticated()) return res.sendStatus(401);

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

      // Broadcast currency changes to all clients immediately
      if (req.params.key.includes('currency')) {
        broadcastToClients({ 
          type: "currency_updated", 
          data: { 
            key: req.params.key, 
            value: value,
            setting: setting
          } 
        });
      }

      // Broadcast system settings changes (team visibility, etc.) to all clients
      if (req.params.key === "showTeamRankings" || req.params.key === "enableTeams") {
        broadcastToClients({ 
          type: "system_settings_updated", 
          data: { 
            key: req.params.key, 
            value: value,
            setting: setting
          } 
        });
      }

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

  // Object Storage endpoints for audio file uploads
  app.post("/api/objects/upload", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      if (!objectStorageService) {
        // Fallback to traditional file upload form
        return res.status(503).json({ 
          error: "Object storage not available. Please use the file upload form instead." 
        });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      if (!objectStorageService) {
        return res.status(404).json({ error: "Object storage not available" });
      }

      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error.constructor.name === "ObjectNotFoundError") {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
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

  // Audio file upload completion endpoint
  app.put("/api/sound-effects/upload-complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { fileUrl, eventType, volume } = req.body;

      if (!fileUrl || !eventType) {
        return res.status(400).json({ error: "fileUrl and eventType are required" });
      }

      // Try to normalize the path for object storage
      let normalizedPath = fileUrl;
      if (objectStorageService && fileUrl.includes('storage.googleapis.com')) {
        normalizedPath = objectStorageService.normalizeObjectEntityPath(fileUrl);
      }

      // Create or update sound effect
      const soundEffectData = {
        eventType,
        fileUrl: normalizedPath,
        volume: volume || 0.5,
        isEnabled: true
      };

      // Check if sound effect already exists for this event type
      const existingSoundEffect = await storage.getSoundEffectByEventType(eventType);

      let soundEffect;
      if (existingSoundEffect) {
        soundEffect = await storage.updateSoundEffect(existingSoundEffect.id, soundEffectData);
      } else {
        soundEffect = await storage.createSoundEffect(soundEffectData);
      }

      res.json({ soundEffect, objectPath: normalizedPath });
    } catch (error) {
      console.error("Error completing audio upload:", error);
      res.status(500).json({ error: "Failed to complete audio upload" });
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

      console.log("Reports API called with query params:", { startDate, endDate, agentId, teamId, reportType });

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

      console.log("Generated report data:", {
        totalSales: reportData.totalSales,
        totalVolume: reportData.totalVolume,
        salesByAgent: reportData.salesByAgent.length,
        salesByTeam: reportData.salesByTeam.length,
        salesByDate: reportData.salesByDate.length
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

  // Target cycle management endpoints
  app.get("/api/agents/:id/target-history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const agentId = parseInt(req.params.id);
      const history = await storage.getAgentTargetHistory(agentId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent target history" });
    }
  });

  app.get("/api/teams/:id/target-history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const teamId = parseInt(req.params.id);
      const history = await storage.getTeamTargetHistory(teamId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team target history" });
    }
  });

  app.get("/api/agents/:id/current-cycle", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const agentId = parseInt(req.params.id);
      const currentCycle = await storage.getCurrentAgentTargetCycle(agentId);
      res.json(currentCycle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current agent cycle" });
    }
  });

  app.get("/api/teams/:id/current-cycle", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const teamId = parseInt(req.params.id);
      const currentCycle = await storage.getCurrentTeamTargetCycle(teamId);
      res.json(currentCycle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current team cycle" });
    }
  });

  // Agent category targets
  app.get("/api/agents/:id/category-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const agentId = parseInt(req.params.id);
      const targets = await storage.getAgentCategoryTargets(agentId);
      res.json(targets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent category targets" });
    }
  });

  app.post("/api/agents/:id/category-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const agentId = parseInt(req.params.id);
      const targetsSchema = z.array(insertAgentCategoryTargetSchema);
      const targets = targetsSchema.parse(req.body);

      // Add agentId to each target
      const targetsWithAgentId = targets.map(target => ({
        ...target,
        agentId
      }));

      await storage.setAgentCategoryTargets(agentId, targetsWithAgentId);

      // Broadcast update
      broadcastToClients({
        type: 'agent_targets_updated',
        data: { agentId, targets: targetsWithAgentId }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent category targets" });
    }
  });

  // Team category targets
  app.get("/api/teams/:id/category-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const teamId = parseInt(req.params.id);
      const targets = await storage.getTeamCategoryTargets(teamId);
      res.json(targets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team category targets" });
    }
  });

  app.post("/api/teams/:id/category-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const teamId = parseInt(req.params.id);
      const targetsSchema = z.array(insertTeamCategoryTargetSchema);
      const targets = targetsSchema.parse(req.body);

      // Add teamId to each target
      const targetsWithTeamId = targets.map(target => ({
        ...target,
        teamId
      }));

      await storage.setTeamCategoryTargets(teamId, targetsWithTeamId);

      // Broadcast update
      broadcastToClients({
        type: 'team_targets_updated',
        data: { teamId, targets: targetsWithTeamId }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update team category targets" });
    }
  });

  app.post("/api/target-cycles/initialize", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      await storage.initializeTargetCycles();
      res.json({ message: "Target cycles initialized successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize target cycles" });
    }
  });

  app.post("/api/target-cycles/reset", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      await storage.checkAndResetTargetCycles();
      res.json({ message: "Target cycles reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset target cycles" });
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