import config from '../app/config';

// SMS Service Interface
interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

interface SMSOptions {
  phoneNumber: string;
  message: string;
  type?: 'text' | 'unicode';
}

// Validate SMS configuration
export const validateSMSConfig = (): boolean => {
  console.log(`[SMS SERVICE] Validating SMS configuration...`);
  console.log(`[SMS SERVICE] SMS API Key: ${config.sms_api_key ? '***SET***' : 'NOT SET'}`);
  console.log(`[SMS SERVICE] SMS Sender ID: ${config.sms_sender_id || 'NOT SET'}`);
  console.log(`[SMS SERVICE] SMS API URL: ${config.sms_api_url || 'NOT SET'}`);
  
  const isValid = !!(config.sms_api_key && config.sms_sender_id && config.sms_api_url);
  
  if (isValid) {
    console.log(`[SMS SERVICE] ✅ SMS configuration is valid`);
    console.log(`[SMS SERVICE] 📱 SMS Provider: BulkSMS BD`);
    console.log(`[SMS SERVICE] 📞 Sender ID: ${config.sms_sender_id}`);
  } else {
    console.log(`[SMS SERVICE] ❌ SMS configuration is incomplete`);
    console.log(`[SMS SERVICE] 📋 Required environment variables:`);
    console.log(`[SMS SERVICE]    - SMS_API_KEY (your BulkSMS BD API key)`);
    console.log(`[SMS SERVICE]    - SMS_SENDER_ID (your sender ID)`);
    console.log(`[SMS SERVICE]    - SMS_API_URL (optional, defaults to BulkSMS BD)`);
  }
  
  return isValid;
};

// Clean and validate phone number
const cleanPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming Bangladesh +880)
  if (cleaned.startsWith('01')) {
    cleaned = '88' + cleaned;
  } else if (!cleaned.startsWith('88')) {
    cleaned = '88' + cleaned;
  }
  
  return cleaned;
};

// Send SMS using BulkSMS BD API
export const sendSMS = async (options: SMSOptions): Promise<SMSResponse> => {
  const maxRetries = 3;
  let lastError: any = null;

  console.log(`[SMS SERVICE] sendSMS called with options:`, options);

  // Validate configuration
  if (!validateSMSConfig()) {
    console.log(`[SMS SERVICE] ❌ SMS configuration validation failed`);
    return {
      success: false,
      error: 'SMS configuration is incomplete. Please check your environment variables.'
    };
  }
  
  console.log(`[SMS SERVICE] ✅ SMS configuration validation passed`);

  const { phoneNumber, message, type = 'text' } = options;
  const cleanedPhone = cleanPhoneNumber(phoneNumber);

  // Validate phone number
  if (!cleanedPhone || cleanedPhone.length < 11) {
    return {
      success: false,
      error: 'Invalid phone number format'
    };
  }

  // Validate message length
  if (!message || message.trim().length === 0) {
    return {
      success: false,
      error: 'Message cannot be empty'
    };
  }

  if (message.length > 160) {
    console.log(`[SMS SERVICE] ⚠️ Message length (${message.length}) exceeds 160 characters, may be split into multiple SMS`);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[SMS SERVICE] Attempt ${attempt}/${maxRetries} - Sending SMS to: ${cleanedPhone}`);
      console.log(`[SMS SERVICE] Message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
      
      // Prepare API URL with parameters
      const apiUrl = new URL(config.sms_api_url!);
      apiUrl.searchParams.append('api_key', config.sms_api_key!);
      apiUrl.searchParams.append('type', type);
      apiUrl.searchParams.append('number', cleanedPhone);
      apiUrl.searchParams.append('senderid', config.sms_sender_id!);
      apiUrl.searchParams.append('message', message);

      console.log(`[SMS SERVICE] API URL: ${apiUrl.toString().replace(config.sms_api_key!, '***API_KEY***')}`);

      // Send SMS using fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoopNest-SMS-Service/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log(`[SMS SERVICE] API Response: ${responseText}`);

      // Parse response (BulkSMS BD typically returns plain text)
      let result: SMSResponse;
      
      if (responseText.includes('SMS sent successfully') || responseText.includes('success')) {
        result = {
          success: true,
          messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        console.log(`[SMS SERVICE] ✅ SMS sent successfully on attempt ${attempt}!`);
        console.log(`[SMS SERVICE] Message ID: ${result.messageId}`);
      } else {
        throw new Error(`SMS API returned error: ${responseText}`);
      }

      return result;

    } catch (error: any) {
      lastError = error;
      console.log(`[SMS SERVICE] ❌ Attempt ${attempt}/${maxRetries} failed for ${cleanedPhone}`);
      console.log(`[SMS SERVICE] Error details:`, {
        message: error.message,
        code: error.code,
        name: error.name
      });
      
      // If it's a network error and we have retries left, wait and try again
      if (attempt < maxRetries && (
        error.name === 'AbortError' ||
        error.message?.includes('timeout') || 
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('ETIMEDOUT')
      )) {
        const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`[SMS SERVICE] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's not a network issue or we're out of retries, break
      break;
    }
  }
  
  // All retries failed
  console.log(`[SMS SERVICE] ❌ All ${maxRetries} attempts failed for ${cleanedPhone}`);
  
  return { 
    success: false, 
    error: lastError?.message || 'Failed to send SMS after all retries',
    details: {
      code: lastError?.code,
      name: lastError?.name,
      phoneNumber: cleanedPhone
    }
  };
};

// Send OTP SMS
export const sendOTPSMS = async (phoneNumber: string, otpCode: string, fullName: string): Promise<SMSResponse> => {
  console.log(`[SMS SERVICE] sendOTPSMS called with:`, { phoneNumber, otpCode, fullName });
  
  const message = `Hello ${fullName}! Your LoopNest verification code is: ${otpCode}. This code expires in 10 minutes. Do not share this code with anyone. - LoopNest Team`;
  
  console.log(`[SMS SERVICE] Generated message:`, message);
  
  return sendSMS({
    phoneNumber,
    message,
    type: 'text'
  });
};

// Send payment accepted SMS
export const sendPaymentAcceptedSMS = async (phoneNumber: string, studentName: string, courseName: string, coursePrice: number): Promise<SMSResponse> => {
  const message = `Hello ${studentName}! Great news! Your payment of $${coursePrice} for "${courseName}" has been accepted. You can now access your course at LoopNest. - LoopNest Team`;
  
  return sendSMS({
    phoneNumber,
    message,
    type: 'text'
  });
};

// Send payment rejected SMS
export const sendPaymentRejectedSMS = async (phoneNumber: string, studentName: string, courseName: string, coursePrice: number, reason?: string): Promise<SMSResponse> => {
  const reasonText = reason ? ` Reason: ${reason}.` : '';
  const message = `Hello ${studentName}! Your payment of $${coursePrice} for "${courseName}" was rejected.${reasonText} Please review your payment details and try again. - LoopNest Team`;
  
  return sendSMS({
    phoneNumber,
    message,
    type: 'text'
  });
};

// Send welcome SMS
export const sendWelcomeSMS = async (phoneNumber: string, fullName: string): Promise<SMSResponse> => {
  const message = `Welcome to LoopNest, ${fullName}! Your account has been created successfully. Start your learning journey with us. Visit: https://theloopnest.com - LoopNest Team`;
  
  return sendSMS({
    phoneNumber,
    message,
    type: 'text'
  });
};

// Send course enrollment SMS
export const sendCourseEnrollmentSMS = async (phoneNumber: string, studentName: string, courseName: string): Promise<SMSResponse> => {
  const message = `Hello ${studentName}! You have been enrolled in "${courseName}". Check your account to start learning. Happy learning! - LoopNest Team`;
  
  return sendSMS({
    phoneNumber,
    message,
    type: 'text'
  });
};

// SMS Service Configuration Guide
export const getSMSConfigurationGuide = () => {
  return {
    title: "LoopNest SMS Configuration Guide",
    description: "Complete guide for setting up SMS notifications with BulkSMS BD",
    
    // Required environment variables
    env_vars: {
      SMS_API_KEY: "Your BulkSMS BD API key",
      SMS_SENDER_ID: "Your approved sender ID (e.g., LoopNest)",
      SMS_API_URL: "SMS API URL (optional, defaults to BulkSMS BD)"
    },
    
    // API Configuration
    api_config: {
      provider: "BulkSMS BD",
      base_url: "http://bulksmsbd.net/api/smsapi",
      methods: ["GET", "POST"],
      parameters: {
        api_key: "Your API key",
        type: "text or unicode",
        number: "Phone number (with country code)",
        senderid: "Your sender ID",
        message: "SMS message content"
      }
    },
    
    // Phone number formatting
    phone_formatting: {
      bangladesh: {
        example: "8801712345678",
        format: "880 + 1X + 8 digits",
        note: "Automatically adds +880 if not present"
      },
      international: {
        example: "+1234567890",
        format: "Country code + number",
        note: "Must include country code"
      }
    },
    
    // Message guidelines
    message_guidelines: {
      max_length: 160,
      recommended_length: 140,
      encoding: "UTF-8",
      special_characters: "Most Unicode characters supported",
      line_breaks: "Use \\n for line breaks"
    },
    
    // Best practices
    best_practices: [
      "Test with your own phone number first",
      "Keep messages concise and clear",
      "Include your brand name in messages",
      "Avoid spam trigger words",
      "Respect SMS frequency limits",
      "Monitor delivery rates",
      "Handle errors gracefully",
      "Use appropriate sender ID"
    ],
    
    // Error handling
    error_handling: {
      network_errors: "Automatic retry with exponential backoff",
      api_errors: "Detailed error logging and reporting",
      validation_errors: "Input validation before sending",
      rate_limiting: "Built-in retry mechanism"
    }
  };
};

// Export SMS service functions
export const SMSService = {
  sendSMS,
  sendOTPSMS,
  sendPaymentAcceptedSMS,
  sendPaymentRejectedSMS,
  sendWelcomeSMS,
  sendCourseEnrollmentSMS,
  validateSMSConfig,
  getSMSConfigurationGuide
};
