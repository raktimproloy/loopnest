import dotenv from "dotenv";
import path from "path";

// Load environment variables for both local development and Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  // Only load .env file in development
  dotenv.config({ path: path.join(process.cwd(), ".env") });
} else {
  // In production (Vercel), environment variables are already available
  console.log('[CONFIG] Using production environment variables from Vercel');
}

// Environment variable validation and logging
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMS_API_KEY',
    'SMS_SENDER_ID'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('[CONFIG] ❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`[CONFIG]   - ${varName}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      console.error('[CONFIG] Please set these variables in your Vercel project dashboard');
      console.error('[CONFIG] Go to: Project Settings > Environment Variables');
    } else {
      console.error('[CONFIG] Please add these variables to your .env file');
    }
    
    // Don't throw error in development, just warn
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  } else {
    console.log('[CONFIG] ✅ All required environment variables are set');
  }

  // Log SMTP configuration status
  console.log('[CONFIG] 📧 SMTP Configuration:');
  console.log(`[CONFIG]   Host: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`[CONFIG]   Port: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`[CONFIG]   User: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`[CONFIG]   Pass: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);
  
  // Log SMS configuration status
  console.log('[CONFIG] 📱 SMS Configuration:');
  console.log(`[CONFIG]   API Key: ${process.env.SMS_API_KEY ? '***SET***' : 'NOT SET'}`);
  console.log(`[CONFIG]   Sender ID: ${process.env.SMS_SENDER_ID || 'NOT SET'}`);
  console.log(`[CONFIG]   API URL: ${process.env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi'}`);
};

// Validate environment variables on startup
validateEnvironmentVariables();

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  base_url: process.env.BASE_URL,
  jwt_secret: process.env.JWT_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  // SMS Configuration
  sms_api_key: process.env.SMS_API_KEY,
  sms_sender_id: process.env.SMS_SENDER_ID,
  sms_api_url: process.env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi',
};
