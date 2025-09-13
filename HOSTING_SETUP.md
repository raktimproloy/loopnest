# LoopNest Backend - Hosting Setup Guide

## Environment Variables Setup

To run LoopNest backend on your hosting server, you need to set the following environment variables:

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL=your_mongodb_connection_string_here

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS Configuration (for SMS notifications)
SMS_API_KEY=your_bulksms_api_key
SMS_SENDER_ID=LoopNest
SMS_API_URL=http://bulksmsbd.net/api/smsapi

# Application Configuration
NODE_ENV=production
PORT=5000
BASE_URL=https://your-domain.com
```

### How to Set Environment Variables

#### Option 1: Using .env file (if supported by your hosting)
Create a `.env` file in your project root with the above variables.

#### Option 2: Using hosting panel
Most hosting providers allow you to set environment variables through their control panel:
- Look for "Environment Variables" or "App Settings"
- Add each variable with its value

#### Option 3: Using command line (if you have SSH access)
```bash
export DATABASE_URL="your_mongodb_connection_string"
export JWT_SECRET="your_jwt_secret_key"
export JWT_REFRESH_SECRET="your_jwt_refresh_secret"
# ... and so on for all variables
```

### Testing Your Setup

After setting the environment variables, you can test your configuration:

1. **Check configuration status:**
   ```bash
   curl https://your-domain.com/api/v1/student/email-config
   curl https://your-domain.com/api/v1/student/sms-config
   ```

2. **Test email sending:**
   ```bash
   curl -X POST https://your-domain.com/api/v1/student/test-email
   ```

3. **Test SMS sending:**
   ```bash
   curl -X POST https://your-domain.com/api/v1/student/test-sms
   ```

### Important Notes

- The application will now start even if some environment variables are missing
- Missing variables will be logged as warnings, not errors
- Features that depend on missing variables will be disabled
- You can add environment variables gradually without breaking the application

### Troubleshooting

If you see warnings about missing environment variables:
1. Check that all required variables are set
2. Restart your application after adding new variables
3. Check the application logs for detailed error messages
4. Use the test endpoints to verify functionality

### Security Notes

- Never commit your `.env` file to version control
- Use strong, unique values for JWT secrets
- Use app passwords for Gmail (not your regular password)
- Keep your API keys secure and don't share them
