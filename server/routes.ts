import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertSaleSchema, insertAgentSchema, insertTeamSchema, insertCashOfferSchema, insertMediaSlideSchema, insertAnnouncementSchema, insertNewsTickerSchema, agentLoginSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

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

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Dashboard data endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const data = await storage.getDashboardData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
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
      const offerData = insertCashOfferSchema.parse(req.body);
      const offer = await storage.createCashOffer(offerData);
      
      broadcastToClients({ type: "cash_offer_created", data: offer });
      
      res.status(201).json(offer);
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
