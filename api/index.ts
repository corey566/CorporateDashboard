import { VercelRequest, VercelResponse } from "@vercel/node";
import { Express } from "express";
import express from "express";
import session from "express-session";
import { setupAuth } from "../server/auth";
import { storage } from "../server/storage";
import { agentLoginSchema } from "../shared/schema";

// Create Express app
const app: Express = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for Vercel
app.use(
  session({
    store: storage.sessionStore,
    secret: process.env.SESSION_SECRET || "vercel-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Always secure in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Setup authentication
setupAuth(app);

// Basic API routes (simplified for Vercel serverless)
app.get("/api/dashboard", async (req, res) => {
  try {
    const data = await storage.getDashboardData();
    res.json(data);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

app.get("/api/agents", async (req, res) => {
  try {
    const agents = await storage.getAgents();
    res.json(agents);
  } catch (error) {
    console.error("Agents error:", error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

app.get("/api/teams", async (req, res) => {
  try {
    const teams = await storage.getTeams();
    res.json(teams);
  } catch (error) {
    console.error("Teams error:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

app.get("/api/news-ticker", async (req, res) => {
  try {
    const ticker = await storage.getActiveNewsTicker();
    res.json(ticker);
  } catch (error) {
    console.error("News ticker error:", error);
    res.status(500).json({ error: "Failed to fetch news ticker" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = agentLoginSchema.parse(req.body);
    
    const agent = await storage.getAgentByUsername(username);
    if (!agent) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Note: In production, you'd verify password here
    req.session.agentId = agent.id;
    res.json({ agent });
  } catch (error) {
    res.status(400).json({ error: "Invalid request" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};