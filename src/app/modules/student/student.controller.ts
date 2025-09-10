import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { StudentServices } from "./student.service";
import config from "../../config";

// Utility function to create secure cookie options for authentication
export const createAuthCookieOptions = (req: any) => {
  const isProd = config.node_env === 'production';
  const host = req.hostname as string | undefined;
  const origin = req.get('origin') || '';

  // Explicitly check for localhost and vercel.app domains
  const isLocalhost = host === 'localhost' || 
                     host === '127.0.0.1' || 
                     host?.includes('localhost') ||
                     origin?.includes('localhost') ||
                     origin?.includes('127.0.0.1');

  const isVercelHost = (host && /\.vercel\.app$/i.test(host)) || 
                      /\.vercel\.app$/i.test(origin) ||
                      /\.vercel\.app$/i.test(config.base_url || '');

  // Set domain based on specific conditions
  let domain: string | undefined;
  if (isVercelHost) {
    domain = '.vercel.app'; // Covers all vercel.app subdomains
  } else if (isLocalhost) {
    domain = undefined; // localhost requires no domain
  } else {
    // For other domains, try to extract the main domain
    if (host && host.includes('.')) {
      const parts = host.split('.');
      if (parts.length >= 2) {
        domain = `.${parts.slice(-2).join('.')}`;
      }
    }
  }

  // Determine security settings
  const needsSecure = isProd || isVercelHost;
  const needsSameSiteNone = isVercelHost; // Required for cross-site cookies on vercel

  const base = {
    httpOnly: true,
    secure: needsSecure,
    sameSite: needsSameSiteNone ? 'none' : 'lax',
    path: '/',
  } as any;
  
  if (domain) base.domain = domain;
  
  return base;
};

// Build cookie options that work for both localhost and *.vercel.app
const getCookieOptions = (req: any) => {
  return createAuthCookieOptions(req);
};

// Helper function to set authentication cookies for BOTH localhost AND vercel.app
const setAuthCookies = (res: any, req: any, accessToken: string, refreshToken: string) => {
  const origin = req.get('origin') || '';
  const host = req.hostname || '';
  const isVercelDeployment = host.includes('vercel.app') || origin.includes('vercel.app');
  
  if (isVercelDeployment) {
    // When deployed on vercel.app, set cookies for both domains
    // Set cookies for vercel.app domain (current domain)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Also set cookies without domain for localhost compatibility
    res.cookie('accessToken_localhost', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.cookie('refreshToken_localhost', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  } else {
    // When running on localhost, set cookies for both domains
    // Set cookies for localhost (no domain)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Set cookies for vercel.app domain (for when frontend is on vercel)
    res.cookie('accessToken_vercel', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.cookie('refreshToken_vercel', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
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
  // Check for refresh token in multiple cookie names
  const refreshTokenCookie = (req as any).cookies?.refreshToken || 
                           (req as any).cookies?.refreshToken_localhost || 
                           (req as any).cookies?.refreshToken_vercel;
  const tokenToUse = req.body.refreshToken || refreshTokenCookie || '';
  const result = await StudentServices.refreshAccessToken(tokenToUse);

  const origin = req.get('origin') || '';
  const host = req.hostname || '';
  const isVercelDeployment = host.includes('vercel.app') || origin.includes('vercel.app');

  if (isVercelDeployment) {
    // When deployed on vercel.app, set cookies for both domains
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accessToken_localhost', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  } else {
    // When running on localhost, set cookies for both domains
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accessToken_vercel', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: { 
      // New access token is stored in HTTP-only cookie for security
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

export const studentController = {
  manualRegister,
  login,
  socialLogin,
  verifyOTP,
  resendOTP,
  refreshToken,
  getProfile,
  updateProfile,
  logout: catchAsync(async (req, res) => {
    // Clear ALL possible authentication cookies from BOTH localhost AND vercel.app
    
    // Clear main cookies (no domain)
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

    // Clear localhost-specific cookies
    res.clearCookie('accessToken_localhost', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });
    
    res.clearCookie('refreshToken_localhost', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    // Clear vercel.app domain cookies
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

    // Clear vercel-specific cookies
    res.clearCookie('accessToken_vercel', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/'
    });
    
    res.clearCookie('refreshToken_vercel', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.vercel.app',
      path: '/'
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  }),
  updateProfileImage: catchAsync(async (req, res) => {
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
  }),
};
