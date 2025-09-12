import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

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
