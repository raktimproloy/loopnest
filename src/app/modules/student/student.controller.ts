import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { StudentServices } from "./student.service";
import config from "../../config";


// Helper function to set authentication cookies for both localhost and vercel.app
const setAuthCookies = (res: any, req: any, accessToken: string, refreshToken: string) => {
  // Set production cookies (.theloopnest.com domain)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".theloopnest.com",
    maxAge: 86400000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".theloopnest.com",
    maxAge: 86400000,
    path: "/",
  });

  // Set cookies for localhost (no domain)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Set cookies for vercel.app domain
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.vercel.app',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.vercel.app',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

// Helper function to clear cookies for both localhost and vercel.app
const clearAuthCookies = (res: any, req: any) => {
  // Clear production cookies (.theloopnest.com domain)
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".theloopnest.com",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".theloopnest.com",
    path: "/",
  });

  // Clear localhost cookies (no domain specified)
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });

  // Clear alternative cookie names that might exist
  res.clearCookie('accessToken_localhost', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });

  res.clearCookie('accessToken_vercel', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.vercel.app',
    path: '/'
  });

  // Clear vercel.app cookies
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.vercel.app',
    path: '/'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.vercel.app',
    path: '/'
  });
};

const manualRegister = catchAsync(async (req, res) => {
  const result = await StudentServices.manualRegisterStudent(req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Student registered successfully. Please check your email for OTP verification.",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await StudentServices.loginStudent(req.body);

  // Set authentication cookies
  setAuthCookies(res, req, result.accessToken, result.refreshToken);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: { 
      student: result.student,
      // Access token is stored in HTTP-only cookie for security
      // Refresh token is also stored in HTTP-only cookie
    },
  });
});

const socialLogin = catchAsync(async (req, res) => {
  const result = await StudentServices.socialLoginStudent(req.body);

  // Set authentication cookies
  setAuthCookies(res, req, result.accessToken, result.refreshToken);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Social login successful",
    data: { 
      student: result.student,
      // Access token is stored in HTTP-only cookie for security
      // Refresh token is also stored in HTTP-only cookie
    },
  });
});

const verifyOTP = catchAsync(async (req, res) => {
  const result = await StudentServices.verifyOTP(req.body.auth_input, req.body.otpCode);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const resendOTP = catchAsync(async (req, res) => {
  const result = await StudentServices.resendOTP(req.body.email);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  // Get refresh token from cookies or body
  const refreshTokenCookie = (req as any).cookies?.refreshToken;
  const tokenToUse = req.body.refreshToken || refreshTokenCookie || '';
  
  const result = await StudentServices.refreshAccessToken(tokenToUse);

  // Set new access token cookie for both localhost and vercel.app
  // Set for localhost (no domain)
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // Set for vercel.app domain
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.theloopnest.com',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: { 
      message: "Access token refreshed and stored in secure cookie"
    },
  });
});

const getProfile = catchAsync(async (req, res) => {
  if (!req.user?.userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
      errorSources: [{ path: 'auth', message: 'User not authenticated' }]
    });
  }

  const result = await StudentServices.getStudentProfile(req.user.userId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  if (!req.user?.userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
      errorSources: [{ path: 'auth', message: 'User not authenticated' }]
    });
  }

  const result = await StudentServices.updateStudentProfile(req.user.userId, req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  // Clear authentication cookies properly based on environment
  console.log('[LOGOUT] Clearing authentication cookies...');
  clearAuthCookies(res, req);
  
  // Log cookies that were cleared for debugging
  console.log('[LOGOUT] Authentication cookies cleared successfully');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const updateProfileImage = catchAsync(async (req, res) => {
  if (!req.user?.userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
      errorSources: [{ path: 'auth', message: 'User not authenticated' }]
    });
  }

  const file = (req as any).file as any;
  if (!file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Image file is required (field name: image)'
    });
  }

  const result = await StudentServices.updateProfileImageFromDisk(req.user.userId, file.filename);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile image updated successfully",
    data: result,
  });
});

const getMyCourses = catchAsync(async (req, res) => {
  if (!req.user?.userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
      errorSources: [{ path: 'auth', message: 'User not authenticated' }]
    });
  }

  const result = await StudentServices.getStudentActiveCourses(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Active courses fetched successfully",
    data: result,
  });
});

const assignCourse = catchAsync(async (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Student ID and Course ID are required'
    });
  }

  const result = await StudentServices.assignCourseToStudent(studentId, courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const removeCourse = catchAsync(async (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Student ID and Course ID are required'
    });
  }

  const result = await StudentServices.removeCourseFromStudent(studentId, courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const sendTestEmail = catchAsync(async (req, res) => {
  console.log('[TEST EMAIL] Sending test email to raktimproloy01@gmail.com');
  
  try {
    // Import email service
    const { sendOTPEmail } = await import('../../../utils/emailService');
    
    // Generate a test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send test email
    const result = await sendOTPEmail('raktimproloy01@gmail.com', testOTP, 'Test User');
    
    if (result.success) {
      console.log('[TEST EMAIL] ✅ Test email sent successfully!');
      console.log('[TEST EMAIL] Message ID:', result.messageId);
      
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Test email sent successfully to raktimproloy01@gmail.com',
        data: {
          messageId: result.messageId,
          otp: testOTP,
          recipient: 'raktimproloy01@gmail.com'
        },
      });
    } else {
      console.log('[TEST EMAIL] ❌ Failed to send test email:', result.error);
      
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'Failed to send test email',
        data: {
          error: result.error,
          details: result.details
        },
      });
    }
  } catch (error: any) {
    console.log('[TEST EMAIL] ❌ Error sending test email:', error.message);
    
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error sending test email',
      data: {
        error: error.message
      },
    });
  }
});

const checkEmailConfig = catchAsync(async (req, res) => {
  console.log('[EMAIL CONFIG] Checking email configuration...');
  
  try {
    // Check environment variables
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
      SMTP_USER: process.env.SMTP_USER || 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };
    
    console.log('[EMAIL CONFIG] Environment variables:', envCheck);
    
    // Test SMTP connection
    const { validateSMTPConfig } = await import('../../../utils/emailService');
    const isValid = validateSMTPConfig();
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Email configuration check completed',
      data: {
        environment: envCheck,
        smtpValid: isValid,
        timestamp: new Date().toISOString(),
        deployment: process.env.VERCEL ? 'Vercel' : 'Local'
      },
    });
  } catch (error: any) {
    console.log('[EMAIL CONFIG] ❌ Error checking email config:', error.message);
    
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error checking email configuration',
      data: {
        error: error.message
      },
    });
  }
});

const sendTestSMS = catchAsync(async (req, res) => {
  console.log('[TEST SMS] Sending test SMS to +8801712345678');
  
  try {
    // Import SMS service
    const { SMSService } = await import('../../../utils/smsService');
    
    // Generate a test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send test SMS
    const result = await SMSService.sendOTPSMS('+8801712345678', testOTP, 'Test User');
    
    if (result.success) {
      console.log('[TEST SMS] ✅ Test SMS sent successfully!');
      console.log('[TEST SMS] Message ID:', result.messageId);
      
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Test SMS sent successfully to +8801712345678',
        data: {
          messageId: result.messageId,
          otp: testOTP,
          recipient: '+8801712345678'
        },
      });
    } else {
      console.log('[TEST SMS] ❌ Failed to send test SMS:', result.error);
      
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'Failed to send test SMS',
        data: {
          error: result.error,
          details: result.details
        },
      });
    }
  } catch (error: any) {
    console.log('[TEST SMS] ❌ Error sending test SMS:', error.message);
    
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error sending test SMS',
      data: {
        error: error.message
      },
    });
  }
});

const checkSMSConfig = catchAsync(async (req, res) => {
  console.log('[SMS CONFIG] Checking SMS configuration...');
  
  try {
    // Check environment variables
    const envCheck = {
      SMS_API_KEY: process.env.SMS_API_KEY ? '***SET***' : 'NOT SET',
      SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'NOT SET',
      SMS_API_URL: process.env.SMS_API_URL || 'http://bulksmsbd.net/api/smsapi',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };
    
    console.log('[SMS CONFIG] Environment variables:', envCheck);
    
    // Test SMS configuration
    const { SMSService } = await import('../../../utils/smsService');
    const isValid = SMSService.validateSMSConfig();
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'SMS configuration check completed',
      data: {
        environment: envCheck,
        smsValid: isValid,
        timestamp: new Date().toISOString(),
        deployment: process.env.VERCEL ? 'Vercel' : 'Local'
      },
    });
  } catch (error: any) {
    console.log('[SMS CONFIG] ❌ Error checking SMS config:', error.message);
    
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error checking SMS configuration',
      data: {
        error: error.message
      },
    });
  }
});

const testPaymentNotification = catchAsync(async (req, res) => {
  console.log('[TEST PAYMENT] Testing payment notification system...');
  
  try {
    // Import notification services
    const { sendPaymentAcceptedNotification, sendPaymentRejectedNotification } = await import('../../../utils/emailService');
    
    const testData = {
      email: 'test@example.com',
      phone: '+8801712345678',
      studentName: 'Test Student',
      courseName: 'Test Course',
      coursePrice: 100
    };
    
    console.log('[TEST PAYMENT] Testing payment accepted notification...');
    const acceptedResult = await sendPaymentAcceptedNotification(
      testData.email,
      testData.phone,
      testData.studentName,
      testData.courseName,
      testData.coursePrice
    );
    
    console.log('[TEST PAYMENT] Testing payment rejected notification...');
    const rejectedResult = await sendPaymentRejectedNotification(
      testData.email,
      testData.phone,
      testData.studentName,
      testData.courseName,
      testData.coursePrice,
      'Test rejection reason'
    );
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment notification test completed',
      data: {
        testData,
        acceptedNotification: {
          email: acceptedResult.email?.success || false,
          sms: acceptedResult.sms?.success || false,
          emailError: acceptedResult.email?.error || null,
          smsError: acceptedResult.sms?.error || null
        },
        rejectedNotification: {
          email: rejectedResult.email?.success || false,
          sms: rejectedResult.sms?.success || false,
          emailError: rejectedResult.email?.error || null,
          smsError: rejectedResult.sms?.error || null
        },
        timestamp: new Date().toISOString()
      },
    });
  } catch (error: any) {
    console.log('[TEST PAYMENT] ❌ Error testing payment notifications:', error.message);
    
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error testing payment notifications',
      data: {
        error: error.message
      },
    });
  }
});

const testPaymentDataFetch = catchAsync(async (req, res) => {
  console.log('[TEST PAYMENT] Testing payment data fetch with phone numbers...');
  
  try {
    // Import payment service
    const { PaymentServices } = await import('../payment/payment.service');
    
    // Get all payments for admin (this will show if phone numbers are being populated)
    const payments = await PaymentServices.listPaymentsForAdmin({ limit: 5 });
    
    // Extract student data from payments
    const studentData = payments.data.map((payment: any) => ({
      paymentId: payment._id,
      studentId: payment.userId?._id,
      studentName: payment.userId?.fullName,
      studentEmail: payment.userId?.email,
      studentPhone: payment.userId?.phone,
      hasEmail: !!payment.userId?.email,
      hasPhone: !!payment.userId?.phone,
      courseName: payment.courseId?.title,
      status: payment.status
    }));
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment data fetch test completed',
      data: {
        totalPayments: payments.meta.total,
        studentData,
        timestamp: new Date().toISOString()
      },
    });
  } catch (error: any) {
    console.log('[TEST PAYMENT] ❌ Error testing payment data fetch:', error.message);
    
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error testing payment data fetch',
      data: {
        error: error.message
      },
    });
  }
});

export const studentController = {
  manualRegister,
  login,
  socialLogin,
  verifyOTP,
  resendOTP,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
  updateProfileImage,
  getMyCourses,
  assignCourse,
  removeCourse,
  sendTestEmail,
  checkEmailConfig,
  sendTestSMS,
  checkSMSConfig,
  testPaymentNotification,
  testPaymentDataFetch,
};