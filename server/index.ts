
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import dotenv from 'dotenv';
import net from 'net';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to check if a port is available
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, '0.0.0.0');
  });
}

// Function to find an available port
async function findAvailablePort(preferredPort: number = 5000): Promise<number> {
  const portsToTry = [preferredPort, 3000, 8080, 8000, 4000, 3001, 5001, 5173, 8081];
  
  for (const port of portsToTry) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  // If all predefined ports are taken, try random ports
  for (let i = 0; i < 10; i++) {
    const randomPort = Math.floor(Math.random() * (9000 - 6000 + 1)) + 6000;
    if (await isPortAvailable(randomPort)) {
      return randomPort;
    }
  }

  throw new Error('No available ports found');
}

(async () => {
  // Initialize target cycles on server startup
  await storage.initializeTargetCycles();
  
  // Set up periodic cycle checking (every hour)
  setInterval(async () => {
    await storage.checkAndResetTargetCycles();
  }, 60 * 60 * 1000); // 1 hour
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use configured port or fallback
  const port = parseInt(process.env.PORT || '5000');
  
  // Check if port is available before starting
  const isAvailable = await isPortAvailable(port);
  if (!isAvailable) {
    console.error(`Port ${port} is already in use. Please stop other instances or change PORT in .env`);
    process.exit(1);
  }
  
  // Save the actual port to environment for domain configuration
  process.env.ACTUAL_PORT = port.toString();

  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Server running on port ${port}`);
    log(`Local: http://localhost:${port}`);
    log(`Network: http://0.0.0.0:${port}`);
    
    if (process.env.APP_DOMAIN) {
      log(`Domain: https://${process.env.APP_DOMAIN}`);
    }
  });
})();
