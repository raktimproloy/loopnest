import nodemailer from 'nodemailer';
import config from '../app/config';
import { SMSService } from './smsService';

const createTransporter = () => {
  const port = Number(config.smtp_port) || 587;
  const isSecure = port === 465; // Port 465 requires SSL/TLS
  
  console.log(`[EMAIL SERVICE] Creating LoopNest transporter with port ${port}, secure: ${isSecure}`);
  
  // Enhanced SMTP configuration with anti-spam measures
  const transporterConfig: any = {
    host: config.smtp_host,
    port: port,
    secure: isSecure,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
    // Connection settings
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
    
    // Anti-spam and deliverability settings
    pool: true, // Use connection pooling
    maxConnections: 5, // Maximum number of connections
    maxMessages: 100, // Maximum messages per connection
    rateLimit: 14, // Maximum messages per second
    
    // Headers to improve deliverability
    name: 'LoopNest', // Sender name
    localName: 'loopnest.com', // Local hostname
    
    // Additional headers for better deliverability
    headers: {
      'X-Mailer': 'LoopNest Email Service v1.0',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
      'X-Report-Abuse': 'Please report abuse to abuse@theloopnest.com',
      'List-Unsubscribe': '<mailto:unsubscribe@theloopnest.com>',
    }
  };

  // For port 465 (SSL), add additional SSL options
  if (port === 465) {
    transporterConfig.tls = {
      rejectUnauthorized: false, // Allow self-signed certificates
      ciphers: 'SSLv3',
      secureProtocol: 'TLSv1_2_method'
    };
  }

  // For port 587 (TLS), add STARTTLS options
  if (port === 587) {
    transporterConfig.requireTLS = true;
    transporterConfig.tls = {
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method'
    };
  }

  console.log(`[EMAIL SERVICE] LoopNest transporter config:`, {
    host: transporterConfig.host,
    port: transporterConfig.port,
    secure: transporterConfig.secure,
    requireTLS: transporterConfig.requireTLS,
    name: transporterConfig.name,
    localName: transporterConfig.localName,
    pool: transporterConfig.pool,
    rateLimit: transporterConfig.rateLimit
  });
  
  return nodemailer.createTransport(transporterConfig);
};

export const validateSMTPConfig = () => {
  console.log(`[EMAIL SERVICE] Validating LoopNest SMTP configuration...`);
  console.log(`[EMAIL SERVICE] SMTP Host: ${config.smtp_host || 'NOT SET'}`);
  console.log(`[EMAIL SERVICE] SMTP Port: ${config.smtp_port || 'NOT SET'}`);
  console.log(`[EMAIL SERVICE] SMTP User: ${config.smtp_user || 'NOT SET'}`);
  console.log(`[EMAIL SERVICE] SMTP Pass: ${config.smtp_pass ? '***SET***' : 'NOT SET'}`);
  
  const isValid = !!(config.smtp_host && config.smtp_port && config.smtp_user && config.smtp_pass);
  
  if (isValid) {
    console.log(`[EMAIL SERVICE] ✅ LoopNest SMTP configuration is valid`);
    console.log(`[EMAIL SERVICE] 📧 Email sender: LoopNest <${config.smtp_user}>`);
    console.log(`[EMAIL SERVICE] 🔒 Security: ${Number(config.smtp_port) === 465 ? 'SSL' : 'TLS'}`);
  } else {
    console.log(`[EMAIL SERVICE] ❌ SMTP configuration is incomplete`);
    console.log(`[EMAIL SERVICE] 📋 Required environment variables:`);
    console.log(`[EMAIL SERVICE]    - SMTP_HOST (e.g., smtp.gmail.com, mail.theloopnest.com)`);
    console.log(`[EMAIL SERVICE]    - SMTP_PORT (e.g., 587 for TLS, 465 for SSL)`);
    console.log(`[EMAIL SERVICE]    - SMTP_USER (e.g., no-reply@theloopnest.com)`);
    console.log(`[EMAIL SERVICE]    - SMTP_PASS (your email password or app password)`);
  }
  
  return isValid;
};

// Comprehensive SMTP configuration guide
export const getSMTPConfigurationGuide = () => {
  return {
    title: "LoopNest SMTP Configuration Guide",
    description: "Complete guide for setting up email delivery with LoopNest",
    
    // Common SMTP providers
    providers: {
      gmail: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "your-email@gmail.com",
          pass: "your-app-password" // Use App Password, not regular password
        },
        notes: "Enable 2FA and generate App Password"
      },
      
      outlook: {
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
          user: "your-email@outlook.com",
          pass: "your-password"
        },
        notes: "Use your regular Outlook password"
      },
      
      yahoo: {
        host: "smtp.mail.yahoo.com",
        port: 587,
        secure: false,
        auth: {
          user: "your-email@yahoo.com",
          pass: "your-app-password"
        },
        notes: "Generate App Password in Yahoo account settings"
      },
      
      custom: {
        host: "mail.yourdomain.com",
        port: 587, // or 465 for SSL
        secure: false, // true for port 465
        auth: {
          user: "no-reply@yourdomain.com",
          pass: "your-email-password"
        },
        notes: "Configure your own mail server"
      }
    },
    
    // Anti-spam measures
    antiSpam: {
      dkim: "Set up DKIM records in your DNS",
      spf: "Add SPF record: v=spf1 include:_spf.google.com ~all",
      dmarc: "Add DMARC record: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com",
      reverse_dns: "Ensure reverse DNS is set up for your IP",
      reputation: "Maintain good sender reputation by avoiding spam triggers"
    },
    
    // Environment variables
    env_vars: {
      SMTP_HOST: "Your SMTP server hostname",
      SMTP_PORT: "Port number (587 for TLS, 465 for SSL)",
      SMTP_USER: "Your email address",
      SMTP_PASS: "Your email password or app password"
    },
    
    // Best practices
    best_practices: [
      "Use a dedicated email address for sending (e.g., no-reply@yourdomain.com)",
      "Set up proper DNS records (SPF, DKIM, DMARC)",
      "Use a professional email template",
      "Include unsubscribe links",
      "Avoid spam trigger words",
      "Test email deliverability",
      "Monitor bounce rates",
      "Use a consistent sender name"
    ]
  };
};

// Alternative transporter for fallback
const createFallbackTransporter = () => {
  const port = Number(config.smtp_port) || 587;
  
  console.log(`[EMAIL SERVICE] Creating fallback transporter with port ${port}`);
  
  // Try with different SSL/TLS settings
  const fallbackConfig: any = {
    host: config.smtp_host,
    port: port,
    secure: false, // Try with secure: false first
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  };

  // If port is 465, try with secure: true
  if (port === 465) {
    fallbackConfig.secure = true;
  }

  return nodemailer.createTransport(fallbackConfig);
};

export const sendOTPEmail = async (email: string, otpCode: string, fullName: string) => {
  const maxRetries = 3;
  let lastError: any = null;

  // Check if SMTP configuration is complete
  if (!config.smtp_host || !config.smtp_port || !config.smtp_user || !config.smtp_pass) {
    console.log(`[EMAIL SERVICE] ❌ SMTP configuration incomplete`);
    console.log(`[EMAIL SERVICE] Missing: ${!config.smtp_host ? 'SMTP_HOST ' : ''}${!config.smtp_port ? 'SMTP_PORT ' : ''}${!config.smtp_user ? 'SMTP_USER ' : ''}${!config.smtp_pass ? 'SMTP_PASS ' : ''}`);
    return {
      success: false,
      error: 'SMTP configuration incomplete. Please check your environment variables.',
      details: {
        missing: {
          host: !config.smtp_host,
          port: !config.smtp_port,
          user: !config.smtp_user,
          pass: !config.smtp_pass
        }
      }
    };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Log email sending attempt
      console.log(`[EMAIL SERVICE] Attempt ${attempt}/${maxRetries} - Sending OTP email to: ${email}`);
      console.log(`[EMAIL SERVICE] SMTP Config - Host: ${config.smtp_host}, Port: ${config.smtp_port}, User: ${config.smtp_user}`);
      
      // Try multiple SMTP configurations
      const smtpConfigs = [
        {
          name: 'Primary Config',
          transporter: createTransporter()
        },
        {
          name: 'Fallback Config',
          transporter: createFallbackTransporter()
        },
        {
          name: 'Gmail Fallback',
          transporter: nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: config.smtp_user,
              pass: config.smtp_pass,
            },
          })
        }
      ];
      
      let transporter = null;
      let workingConfig = null;
      
      // Try each configuration until one works
      for (const smtpConfig of smtpConfigs) {
        try {
          console.log(`[EMAIL SERVICE] Testing ${smtpConfig.name}...`);
          await smtpConfig.transporter.verify();
          console.log(`[EMAIL SERVICE] ✅ ${smtpConfig.name} connection verified successfully`);
          transporter = smtpConfig.transporter;
          workingConfig = smtpConfig.name;
          break;
        } catch (verifyError: any) {
          console.log(`[EMAIL SERVICE] ❌ ${smtpConfig.name} failed:`, verifyError.message);
          continue;
        }
      }
      
      if (!transporter) {
        throw new Error('All SMTP configurations failed');
      }
      
      console.log(`[EMAIL SERVICE] Using ${workingConfig} for email delivery`);
      
      const mailOptions = {
        from: {
          name: 'LoopNest',
          address: config.smtp_user || 'no-reply@theloopnest.com'
        },
        to: email,
        subject: 'Verify Your Email Address - LoopNest Account',
        // Plain text version for better deliverability
        text: `
Hello ${fullName},

Welcome to LoopNest! Thank you for creating an account with us.

To complete your registration, please use the following verification code:

${otpCode}

This code will expire in 10 minutes for security reasons.

If you didn't create an account with LoopNest, please ignore this email.

Best regards,
The LoopNest Team

---
LoopNest - Your Learning Platform
Website: https://theloopnest.com
Support: support@theloopnest.com
        `,
        // Enhanced HTML version with better structure
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - LoopNest</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { color: #333333; font-size: 18px; margin-bottom: 20px; }
        .message { color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .otp-container { background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp-code { color: #007bff; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace; }
        .expiry { color: #dc3545; font-size: 14px; margin-top: 10px; font-weight: 500; }
        .security-note { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; color: #856404; font-size: 14px; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6; }
        .footer p { color: #666666; font-size: 14px; margin: 5px 0; }
        .footer a { color: #007bff; text-decoration: none; }
        .logo { font-size: 24px; font-weight: bold; color: #ffffff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LoopNest</div>
            <h1>Email Verification</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${fullName}!</div>
            
            <div class="message">
                Welcome to <strong>LoopNest</strong>! Thank you for creating an account with us. 
                We're excited to have you join our learning community.
            </div>
            
            <div class="message">
                To complete your registration and secure your account, please use the verification code below:
            </div>
            
            <div class="otp-container">
                <div class="otp-code">${otpCode}</div>
                <div class="expiry">⏰ Expires in 10 minutes</div>
            </div>
            
            <div class="security-note">
                <strong>Security Note:</strong> This code is valid for 10 minutes only. 
                If you didn't create an account with LoopNest, please ignore this email and 
                consider changing your password if you use the same credentials elsewhere.
            </div>
            
            <div class="message">
                Once verified, you'll have full access to our courses, resources, and learning tools.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>LoopNest - Your Learning Platform</strong></p>
            <p>Website: <a href="https://theloopnest.com">https://theloopnest.com</a></p>
            <p>Support: <a href="mailto:support@theloopnest.com">support@theloopnest.com</a></p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This email was sent to ${email}. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
        `,
        // Additional headers for better deliverability
        headers: {
          'X-Mailer': 'LoopNest Email Service v1.0',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Report-Abuse': 'Please report abuse to abuse@theloopnest.com',
          'List-Unsubscribe': '<mailto:unsubscribe@theloopnest.com>',
          'X-Entity-Ref-ID': `loopnest-otp-${Date.now()}`,
          'X-LoopNest-Type': 'verification',
          'X-LoopNest-Version': '1.0'
        }
      };

      console.log(`[EMAIL SERVICE] Sending email with options:`, {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`[EMAIL SERVICE] ✅ Email sent successfully on attempt ${attempt}!`);
      console.log(`[EMAIL SERVICE] Message ID: ${result.messageId || 'N/A'}`);
      console.log(`[EMAIL SERVICE] Response: ${result.response || 'N/A'}`);
      
      return { success: true, messageId: result.messageId || 'N/A' };
    } catch (error: any) {
      lastError = error;
      console.log(`[EMAIL SERVICE] ❌ Attempt ${attempt}/${maxRetries} failed for ${email}`);
      console.log(`[EMAIL SERVICE] Error details:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      // If it's a connection timeout and we have retries left, wait and try again
      if (attempt < maxRetries && (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'EAUTH')) {
        console.log(`[EMAIL SERVICE] Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      // If it's not a connection issue or we're out of retries, break
      break;
    }
  }
  
  // All retries failed
  console.log(`[EMAIL SERVICE] ❌ All ${maxRetries} attempts failed for ${email}`);
  
  return { 
    success: false, 
    error: lastError?.message || 'Failed to send email after all retries',
    details: {
      code: lastError?.code,
      command: lastError?.command,
      response: lastError?.response
    }
  };
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Unified notification service that handles both email and SMS
export const sendOTPNotification = async (authInput: string, otpCode: string, fullName: string) => {
  const isEmail = /@/.test(authInput);
  const results = {
    email: null as any,
    sms: null as any
  };

  if (isEmail) {
    // Send email OTP
    console.log(`[NOTIFICATION SERVICE] Sending OTP via email to: ${authInput}`);
    results.email = await sendOTPEmail(authInput, otpCode, fullName);
  } else {
    // Send SMS OTP
    console.log(`[NOTIFICATION SERVICE] Sending OTP via SMS to: ${authInput}`);
    results.sms = await SMSService.sendOTPSMS(authInput, otpCode, fullName);
  }

  return results;
};

export const sendPaymentAcceptedNotification = async (email: string, phone: string, studentName: string, courseName: string, coursePrice: number) => {
  const results = {
    email: null as any,
    sms: null as any
  };

  // Send email notification if email is available
  if (email) {
    console.log(`[NOTIFICATION SERVICE] Sending payment accepted email to: ${email}`);
    results.email = await sendPaymentAcceptedEmail(email, studentName, courseName, coursePrice);
  }

  // Send SMS notification if phone is available
  if (phone) {
    console.log(`[NOTIFICATION SERVICE] Sending payment accepted SMS to: ${phone}`);
    results.sms = await SMSService.sendPaymentAcceptedSMS(phone, studentName, courseName, coursePrice);
  }

  return results;
};

export const sendPaymentRejectedNotification = async (email: string, phone: string, studentName: string, courseName: string, coursePrice: number, reason?: string) => {
  const results = {
    email: null as any,
    sms: null as any
  };

  // Send email notification if email is available
  if (email) {
    console.log(`[NOTIFICATION SERVICE] Sending payment rejected email to: ${email}`);
    results.email = await sendPaymentRejectedEmail(email, studentName, courseName, coursePrice, reason);
  }

  // Send SMS notification if phone is available
  if (phone) {
    console.log(`[NOTIFICATION SERVICE] Sending payment rejected SMS to: ${phone}`);
    results.sms = await SMSService.sendPaymentRejectedSMS(phone, studentName, courseName, coursePrice, reason);
  }

  return results;
};

// Payment notification email functions
export const sendPaymentAcceptedEmail = async (email: string, studentName: string, courseName: string, coursePrice: number) => {
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[EMAIL SERVICE] Attempt ${attempt}/${maxRetries} - Sending payment accepted email to: ${email}`);
      
      let transporter = createTransporter();
      
      // Verify SMTP connection
      try {
        await transporter.verify();
        console.log(`[EMAIL SERVICE] ✅ SMTP connection verified successfully`);
      } catch (verifyError: any) {
        console.log(`[EMAIL SERVICE] Primary transporter failed, trying fallback...`);
        transporter = createFallbackTransporter();
        await transporter.verify();
        console.log(`[EMAIL SERVICE] ✅ Fallback SMTP connection verified successfully`);
      }
      
      const mailOptions = {
        from: {
          name: 'LoopNest',
          address: config.smtp_user || 'no-reply@theloopnest.com'
        },
        to: email,
        subject: '🎉 Payment Accepted - You Can Now Access Your Course!',
        text: `
Hello ${studentName},

Great news! Your payment for "${courseName}" has been accepted and processed successfully.

Course Details:
- Course: ${courseName}
- Amount: Tk${coursePrice}
- Status: ✅ Accepted

You can now access your course and start learning immediately!

Log in to your account at https://theloopnest.com to begin your learning journey.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The LoopNest Team

---
LoopNest - Your Learning Platform
Website: https://theloopnest.com
Support: support@theloopnest.com
        `,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Accepted - LoopNest</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { color: #333333; font-size: 18px; margin-bottom: 20px; }
        .message { color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .success-container { background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .success-icon { font-size: 48px; color: #28a745; margin-bottom: 15px; }
        .course-details { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .course-detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .course-detail-row:last-child { border-bottom: none; margin-bottom: 0; }
        .course-detail-label { font-weight: 600; color: #495057; }
        .course-detail-value { color: #007bff; font-weight: 500; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .cta-button:hover { background: linear-gradient(135deg, #0056b3 0%, #004085 100%); }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6; }
        .footer p { color: #666666; font-size: 14px; margin: 5px 0; }
        .footer a { color: #007bff; text-decoration: none; }
        .logo { font-size: 24px; font-weight: bold; color: #ffffff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LoopNest</div>
            <h1>🎉 Payment Accepted!</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${studentName}!</div>
            
            <div class="message">
                Great news! Your payment has been accepted and processed successfully. 
                You can now access your course and start your learning journey immediately.
            </div>
            
            <div class="success-container">
                <div class="success-icon">✅</div>
                <h2 style="color: #28a745; margin: 0;">Payment Confirmed</h2>
                <p style="color: #155724; margin: 10px 0 0 0;">Your course is now available in your account</p>
            </div>
            
            <div class="course-details">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 20px;">Course Details</h3>
                <div class="course-detail-row">
                    <span class="course-detail-label">Course Name:</span>
                    <span class="course-detail-value">${courseName}</span>
                </div>
                <div class="course-detail-row">
                    <span class="course-detail-label">Amount Paid:</span>
                    <span class="course-detail-value">Tk${coursePrice}</span>
                </div>
                <div class="course-detail-row">
                    <span class="course-detail-label">Status:</span>
                    <span class="course-detail-value" style="color: #28a745;">✅ Accepted</span>
                </div>
            </div>
            
            <div class="message">
                <strong>What's Next?</strong><br>
                • Log in to your LoopNest account<br>
                • Navigate to "My Courses" section<br>
                • Start learning with your newly enrolled course<br>
                • Access all course materials, videos, and resources
            </div>
            
            <div style="text-align: center;">
                <a href="https://theloopnest.com/login" class="cta-button">Access My Course</a>
            </div>
            
            <div class="message">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>LoopNest - Your Learning Platform</strong></p>
            <p>Website: <a href="https://theloopnest.com">https://theloopnest.com</a></p>
            <p>Support: <a href="mailto:support@theloopnest.com">support@theloopnest.com</a></p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This email was sent to ${email}. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
        `,
        headers: {
          'X-Mailer': 'LoopNest Email Service v1.0',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Report-Abuse': 'Please report abuse to abuse@theloopnest.com',
          'List-Unsubscribe': '<mailto:unsubscribe@theloopnest.com>',
          'X-Entity-Ref-ID': `loopnest-payment-accepted-${Date.now()}`,
          'X-LoopNest-Type': 'payment-accepted',
          'X-LoopNest-Version': '1.0'
        }
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`[EMAIL SERVICE] ✅ Payment accepted email sent successfully on attempt ${attempt}!`);
      console.log(`[EMAIL SERVICE] Message ID: ${result.messageId || 'N/A'}`);
      
      return { success: true, messageId: result.messageId || 'N/A' };
    } catch (error: any) {
      lastError = error;
      console.log(`[EMAIL SERVICE] ❌ Attempt ${attempt}/${maxRetries} failed for payment accepted email to ${email}`);
      console.log(`[EMAIL SERVICE] Error details:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      if (attempt < maxRetries && (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'EAUTH')) {
        console.log(`[EMAIL SERVICE] Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      break;
    }
  }
  
  console.log(`[EMAIL SERVICE] ❌ All ${maxRetries} attempts failed for payment accepted email to ${email}`);
  
  return { 
    success: false, 
    error: lastError?.message || 'Failed to send payment accepted email after all retries',
    details: {
      code: lastError?.code,
      command: lastError?.command,
      response: lastError?.response
    }
  };
};

export const sendPaymentRejectedEmail = async (email: string, studentName: string, courseName: string, coursePrice: number, reason?: string) => {
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[EMAIL SERVICE] Attempt ${attempt}/${maxRetries} - Sending payment rejected email to: ${email}`);
      
      let transporter = createTransporter();
      
      // Verify SMTP connection
      try {
        await transporter.verify();
        console.log(`[EMAIL SERVICE] ✅ SMTP connection verified successfully`);
      } catch (verifyError: any) {
        console.log(`[EMAIL SERVICE] Primary transporter failed, trying fallback...`);
        transporter = createFallbackTransporter();
        await transporter.verify();
        console.log(`[EMAIL SERVICE] ✅ Fallback SMTP connection verified successfully`);
      }
      
      const mailOptions = {
        from: {
          name: 'LoopNest',
          address: config.smtp_user || 'no-reply@theloopnest.com'
        },
        to: email,
        subject: 'Payment Rejected - Please Review Your Payment Details',
        text: `
Hello ${studentName},

We regret to inform you that your payment for "${courseName}" has been rejected.

Course Details:
- Course: ${courseName}
- Amount: $${coursePrice}
- Status: ❌ Rejected
${reason ? `- Reason: ${reason}` : ''}

Please review your payment details and try again. If you believe this is an error, please contact our support team immediately.

You can submit a new payment request through your account dashboard.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The LoopNest Team

---
LoopNest - Your Learning Platform
Website: https://theloopnest.com
Support: support@theloopnest.com
        `,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Rejected - LoopNest</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { color: #333333; font-size: 18px; margin-bottom: 20px; }
        .message { color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .rejection-container { background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
        .rejection-icon { font-size: 48px; color: #dc3545; margin-bottom: 15px; }
        .course-details { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .course-detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .course-detail-row:last-child { border-bottom: none; margin-bottom: 0; }
        .course-detail-label { font-weight: 600; color: #495057; }
        .course-detail-value { color: #dc3545; font-weight: 500; }
        .reason-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; color: #856404; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .cta-button:hover { background: linear-gradient(135deg, #0056b3 0%, #004085 100%); }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6; }
        .footer p { color: #666666; font-size: 14px; margin: 5px 0; }
        .footer a { color: #007bff; text-decoration: none; }
        .logo { font-size: 24px; font-weight: bold; color: #ffffff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LoopNest</div>
            <h1>Payment Rejected</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${studentName},</div>
            
            <div class="message">
                We regret to inform you that your payment has been rejected. 
                Please review the details below and take the necessary action.
            </div>
            
            <div class="rejection-container">
                <div class="rejection-icon">❌</div>
                <h2 style="color: #dc3545; margin: 0;">Payment Rejected</h2>
                <p style="color: #721c24; margin: 10px 0 0 0;">Please review your payment details</p>
            </div>
            
            <div class="course-details">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 20px;">Course Details</h3>
                <div class="course-detail-row">
                    <span class="course-detail-label">Course Name:</span>
                    <span class="course-detail-value">${courseName}</span>
                </div>
                <div class="course-detail-row">
                    <span class="course-detail-label">Amount:</span>
                    <span class="course-detail-value">$${coursePrice}</span>
                </div>
                <div class="course-detail-row">
                    <span class="course-detail-label">Status:</span>
                    <span class="course-detail-value" style="color: #dc3545;">❌ Rejected</span>
                </div>
            </div>
            
            ${reason ? `
            <div class="reason-box">
                <strong>Reason for Rejection:</strong><br>
                ${reason}
            </div>
            ` : ''}
            
            <div class="message">
                <strong>What You Can Do:</strong><br>
                • Review your payment details and try again<br>
                • Contact our support team if you believe this is an error<br>
                • Submit a new payment request through your account<br>
                • Check your bank account for any issues
            </div>
            
            <div style="text-align: center;">
                <a href="https://theloopnest.com/payments" class="cta-button">Submit New Payment</a>
            </div>
            
            <div class="message">
                If you have any questions or need assistance, please don't hesitate to contact our support team. 
                We're here to help you resolve any payment issues.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>LoopNest - Your Learning Platform</strong></p>
            <p>Website: <a href="https://theloopnest.com">https://theloopnest.com</a></p>
            <p>Support: <a href="mailto:support@theloopnest.com">support@theloopnest.com</a></p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This email was sent to ${email}. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
        `,
        headers: {
          'X-Mailer': 'LoopNest Email Service v1.0',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Report-Abuse': 'Please report abuse to abuse@theloopnest.com',
          'List-Unsubscribe': '<mailto:unsubscribe@theloopnest.com>',
          'X-Entity-Ref-ID': `loopnest-payment-rejected-${Date.now()}`,
          'X-LoopNest-Type': 'payment-rejected',
          'X-LoopNest-Version': '1.0'
        }
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`[EMAIL SERVICE] ✅ Payment rejected email sent successfully on attempt ${attempt}!`);
      console.log(`[EMAIL SERVICE] Message ID: ${result.messageId || 'N/A'}`);
      
      return { success: true, messageId: result.messageId || 'N/A' };
    } catch (error: any) {
      lastError = error;
      console.log(`[EMAIL SERVICE] ❌ Attempt ${attempt}/${maxRetries} failed for payment rejected email to ${email}`);
      console.log(`[EMAIL SERVICE] Error details:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      if (attempt < maxRetries && (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'EAUTH')) {
        console.log(`[EMAIL SERVICE] Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      break;
    }
  }
  
  console.log(`[EMAIL SERVICE] ❌ All ${maxRetries} attempts failed for payment rejected email to ${email}`);
  
  return { 
    success: false, 
    error: lastError?.message || 'Failed to send payment rejected email after all retries',
    details: {
      code: lastError?.code,
      command: lastError?.command,
      response: lastError?.response
    }
  };
};
