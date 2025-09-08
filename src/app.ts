import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import config from "./app/config";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  config.base_url as string,
].filter(Boolean) as string[];

const allowedOriginPatterns = [
  /https?:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /https?:\/\/[a-z0-9-]+\.netlify\.app$/i,
  /https?:\/\/[a-z0-9-]+\.onrender\.com$/i,
  /https?:\/\/[a-z0-9-]+\.render\.com$/i,
];

// Parsers
app.use(express.json());
// Serve static files from public directory
app.use("/public", express.static(path.join(process.cwd(), "public")));
// Allow all origins (with credentials) - relaxed CORS for development/any domain
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());

// Application Routes
app.use("/api/v1/", router);

app.get("/api/v1/", (req: Request, res: Response) => {
  res.send("Loop Nest API Live Now 1");
});

app.get("/", (req: Request, res: Response) => {
  const name = "Loop Nest server live now";
  res.send(name);
});

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

// Handle 404 routes
app.use(notFound);

export default app;
