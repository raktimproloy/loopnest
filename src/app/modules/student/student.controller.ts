import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { StudentServices } from "./student.service";
import config from "../../config";

// Utility function to create secure cookie options for authentication
export const createAuthCookieOptions = (req: any) => {
  const isProd = config.node_env === 'production';
  const host = req.hostname as string || '';
  const origin = req.get('origin') || '';

  // Check if we're on localhost
  const isLocalhost = host === 'localhost' || 
                     host === '127.0.0.1' || 
                     host.includes('localhost') ||
                     origin.includes('localhost') ||
                     origin.includes('127.0.0.1');

  // Check if we're on Vercel
  const isVercelHost = host.endsWith('.vercel.app') || 
                      origin.includes('.vercel.app');

  let cookieOptions = {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  } as any;

  if (isLocalhost) {
    // For localhost, don't set domain, use lax sameSite, no secure
    cookieOptions.secure = false;
    cookieOptions.sameSite = 'lax';
    // Don't set domain for localhost
  } else if (isVercelHost || isProd) {
    // For production/Vercel, use secure settings
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
    
    if (isVercelHost) {
      // Extract the full vercel domain (e.g., your-app-name.vercel.app)
      const vercelDomain = host.endsWith('.vercel.app') ? host : new URL(origin).hostname;
      cookieOptions.domain = vercelDomain;
    }
  }

  return cookieOptions;
};

// Helper function to set authentication cookies properly
const setAuthCookies = (res: any, req: any, accessToken: string, refreshToken: string) => {
  const host = req.hostname || '';
  const origin = req.get('origin') || '';
  
  // Check environment
  const isLocalhost = host === 'localhost' || 
                     host === '127.0.0.1' || 
                     host.includes('localhost');
                     
  const isVercelHost = host.endsWith('.vercel.app') || 
                      origin.includes('.vercel.app');

  if (isLocalhost) {
    // Running locally - set cookies for localhost only
    const localCookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('accessToken', accessToken, {
      ...localCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.cookie('refreshToken', refreshToken, {
      ...localCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

  } else if (isVercelHost) {
    // Running on Vercel - set cookies for the specific Vercel domain
    const vercelDomain = host.endsWith('.vercel.app') ? host : new URL(origin).hostname;
    
    const vercelCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      domain: vercelDomain,
      path: '/',
    };

    res.cookie('accessToken', accessToken, {
      ...vercelCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.cookie('refreshToken', refreshToken, {
      ...vercelCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

  } else {
    // Other production environments
    const prodCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('accessToken', accessToken, {
      ...prodCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.cookie('refreshToken', refreshToken, {
      ...prodCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }
};

// Helper function to clear cookies properly
const clearAuthCookies = (res: any, req: any) => {
  const host = req.hostname || '';
  const origin = req.get('origin') || '';
  
  const isLocalhost = host === 'localhost' || 
                     host === '127.0.0.1' || 
                     host.includes('localhost');
                     
  const isVercelHost = host.endsWith('.vercel.app') || 
                      origin.includes('.vercel.app');

  if (isLocalhost) {
    // Clear localhost cookies
    const localClearOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.clearCookie('accessToken', localClearOptions);
    res.clearCookie('refreshToken', localClearOptions);

  } else if (isVercelHost) {
    // Clear Vercel cookies
    const vercelDomain = host.endsWith('.vercel.app') ? host : new URL(origin).hostname;
    
    const vercelClearOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      domain: vercelDomain,
      path: '/',
    };

    res.clearCookie('accessToken', vercelClearOptions);
    res.clearCookie('refreshToken', vercelClearOptions);

  } else {
    // Clear production cookies
    const prodClearOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.clearCookie('accessToken', prodClearOptions);
    res.clearCookie('refreshToken', prodClearOptions);
  }
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

  // Set new access token cookie with same strategy
  const host = req.hostname || '';
  const origin = req.get('origin') || '';
  
  const isLocalhost = host === 'localhost' || 
                     host === '127.0.0.1' || 
                     host.includes('localhost');
                     
  const isVercelHost = host.endsWith('.vercel.app') || 
                      origin.includes('.vercel.app');

  if (isLocalhost) {
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  } else if (isVercelHost) {
    const vercelDomain = host.endsWith('.vercel.app') ? host : new URL(origin).hostname;
    
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: vercelDomain,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  } else {
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }
  
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
  clearAuthCookies(res, req);

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
};