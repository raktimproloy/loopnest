import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import mongoose from "mongoose";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import config from "./app/config";
import { validateSMTPConfig, getSMTPConfigurationGuide } from "./utils/emailService";

const app = express();

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "http://localhost:3002",
//   "https://loop-nest.vercel.app",
//   "https://loop-nest-student-dashboard.vercel.app",
//   "https://loop-nest-admin-dashboard.vercel.app",
//   config.base_url as string,
// ].filter(Boolean) as string[];

// const allowedOriginPatterns = [
//   /https?:\/\/[a-z0-9-]+\.vercel\.app$/i,
//   /https?:\/\/[a-z0-9-]+\.netlify\.app$/i,
//   /https?:\/\/[a-z0-9-]+\.onrender\.com$/i,
//   /https?:\/\/[a-z0-9-]+\.render\.com$/i,
// ];

// // CORS configuration function
// const corsOptions = {
//   origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     // Check if origin is in allowed origins
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
    
//     // Check if origin matches any pattern
//     const isAllowed = allowedOriginPatterns.some(pattern => pattern.test(origin));
//     if (isAllowed) {
//       return callback(null, true);
//     }
    
//     // Allow all origins for development
//     if (config.node_env === 'development') {
//       return callback(null, true);
//     }
    
//     callback(new Error('Not allowed by CORS'), false);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
//   exposedHeaders: ['Set-Cookie'],
//   optionsSuccessStatus: 200
// };


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://loop-nest.vercel.app",
  "https://loop-nest-student-dashboard.vercel.app",
  "https://loop-nest-admin-dashboard.vercel.app",
]
// মেক শিওর করিয়েন যে লিংক এর পরে কোন / বা কিচ্ছু নাই, জাস্ট প্লেইন URL

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Cookie",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

// Validate SMTP configuration at startup
validateSMTPConfig();

// Display SMTP configuration guide if needed
if (config.node_env === 'development') {
  console.log('\n=== LoopNest SMTP Configuration Guide ===');
  const guide = getSMTPConfigurationGuide();
  console.log(`\n📧 ${guide.title}`);
  console.log(`📝 ${guide.description}\n`);
  
  console.log('🔧 Common SMTP Providers:');
  Object.entries(guide.providers).forEach(([name, config]) => {
    console.log(`\n  ${name.toUpperCase()}:`);
    console.log(`    Host: ${config.host}`);
    console.log(`    Port: ${config.port}`);
    console.log(`    Secure: ${config.secure}`);
    console.log(`    User: ${config.auth.user}`);
    console.log(`    Notes: ${config.notes}`);
  });
  
  console.log('\n🛡️ Anti-Spam Measures:');
  Object.entries(guide.antiSpam).forEach(([key, value]) => {
    console.log(`  ${key.toUpperCase()}: ${value}`);
  });
  
  console.log('\n📋 Environment Variables:');
  Object.entries(guide.env_vars).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('\n✅ Best Practices:');
  guide.best_practices.forEach((practice, index) => {
    console.log(`  ${index + 1}. ${practice}`);
  });
  
  console.log('\n==========================================\n');
}

// Parsers
app.use(express.json());
// Serve static files from public directory
app.use("/public", express.static(path.join(process.cwd(), "public")));
// CORS middleware
app.use(cookieParser());

// Ensure MongoDB connection on serverless (Vercel) before handling requests
const connectMongoOnce = async () => {
  if (!config.database_url) return;
  if (mongoose.connection.readyState === 1) return;
  if ((global as any).__mongooseConnPromise) {
    await (global as any).__mongooseConnPromise;
    return;
  }
  (global as any).__mongooseConnPromise = mongoose.connect(config.database_url as string);
  await (global as any).__mongooseConnPromise;
};

app.use(async (_req, _res, next) => {
  try {
    await connectMongoOnce();
    next();
  } catch (err) {
    next(err);
  }
});

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
