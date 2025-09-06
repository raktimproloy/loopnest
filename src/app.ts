import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
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
  "https://localhost:3000",
  "https://localhost:5173",
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
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (allowedOriginPatterns.some((re) => re.test(origin))) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
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
