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
  "http://localhost:3003",
  "http://localhost:3004",
  "https://loop-nest.vercel.app",
  "https://loop-nest-student-dashboard.vercel.app",
  "https://loop-nest-admin-dashboard.vercel.app",

  "https://theloopnest.com",
  "https://student.theloopnest.com",
  "https://paneladmin.theloopnest.com",


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

// Validate SMS configuration at startup
import { SMSService } from './utils/smsService';
SMSService.validateSMSConfig();

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

// Enhanced MongoDB connection with proper timeout and error handling
const connectMongoOnce = async () => {
  if (!config.database_url) {
    console.log('[DATABASE] ❌ No DATABASE_URL provided');
    throw new Error('Database URL is not configured');
  }
  
  if (mongoose.connection.readyState === 1) {
    console.log('[DATABASE] ✅ Already connected to MongoDB');
    return;
  }
  
  if ((global as any).__mongooseConnPromise) {
    console.log('[DATABASE] ⏳ Waiting for existing connection...');
    await (global as any).__mongooseConnPromise;
    return;
  }

  console.log('[DATABASE] 🔌 Connecting to MongoDB...');
  console.log('[DATABASE] URL:', config.database_url.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

  // Enhanced connection options
  const connectionOptions = {
    // Connection timeout settings
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 30000, // 30 seconds
    maxPoolSize: 10, // Maximum number of connections
    minPoolSize: 2, // Minimum number of connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Heartbeat settings
    heartbeatFrequencyMS: 10000, // 10 seconds
    
    // Modern MongoDB driver options
    directConnection: false, // Use connection pooling
    compressors: ['zlib' as const], // Enable compression
  };

  try {
    (global as any).__mongooseConnPromise = mongoose.connect(config.database_url as string, connectionOptions);
    await (global as any).__mongooseConnPromise;
    console.log('[DATABASE] ✅ Successfully connected to MongoDB');
    
    // Set mongoose options to prevent buffering issues
    mongoose.set('bufferCommands', false);
    // Note: bufferMaxEntries is deprecated in newer versions
    
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.log('[DATABASE] ❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('[DATABASE] ⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('[DATABASE] ✅ MongoDB reconnected');
    });
    
  } catch (error: any) {
    console.log('[DATABASE] ❌ Failed to connect to MongoDB:', error.message);
    (global as any).__mongooseConnPromise = null; // Reset promise on error
    throw error;
  }
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

// Database health check endpoint
app.get("/api/v1/health", async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      success: true,
      message: "LoopNest API is running",
      database: {
        status: dbStates[dbState as keyof typeof dbStates] || 'unknown',
        readyState: dbState,
        host: mongoose.connection.host || 'N/A',
        port: mongoose.connection.port || 'N/A',
        name: mongoose.connection.name || 'N/A'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
      database: {
        status: 'error',
        readyState: mongoose.connection.readyState
      }
    });
  }
});

app.get("/api/v1/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "LoopNest API is live",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "LoopNest server is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

// Handle 404 routes
app.use(notFound);

export default app;
