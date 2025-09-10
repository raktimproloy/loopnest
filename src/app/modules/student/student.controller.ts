import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { StudentServices } from "./student.service";
import config from "../../config";


// Helper function to set authentication cookies for both localhost and vercel.app
const setAuthCookies = (res: any, req: any, accessToken: string, refreshToken: string) => {

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".vercel.app",
    maxAge: 86400000,
    path: "/",
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".vercel.app",
    maxAge: 86400000,
    path: "/",
  })

  // // Set cookies for localhost (no domain)
  // res.cookie('accessToken', accessToken, {
  //   httpOnly: true,
  //   secure: false,
  //   sameSite: 'lax',
  //   path: '/',
  //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  // });
  
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true,
  //   secure: false,
  //   sameSite: 'lax',
  //   path: '/',
  //   maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  // });

  // // Set cookies for vercel.app domain
  // res.cookie('accessToken', accessToken, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  //   domain: '.vercel.app',
  //   path: '/',
  //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  // });
  
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  //   domain: '.vercel.app',
  //   path: '/',
  //   maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  // });
};

// Helper function to clear cookies for both localhost and vercel.app
const clearAuthCookies = (res: any, req: any) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".vercel.app",
    maxAge: 86400000,
    path: "/",
  })

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: ".vercel.app",
    maxAge: 86400000,
    path: "/",
  })

  // // Clear localhost cookies
  // res.clearCookie('accessToken', {
  //   httpOnly: true,
  //   secure: false,
  //   sameSite: 'lax',
  //   path: '/'
  // });
  
  // res.clearCookie('refreshToken', {
  //   httpOnly: true,
  //   secure: false,
  //   sameSite: 'lax',
  //   path: '/'
  // });

  // // Clear vercel.app cookies
  // res.clearCookie('accessToken', {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  //   domain: '.vercel.app',
  //   path: '/'
  // });
  
  // res.clearCookie('refreshToken', {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  //   domain: '.vercel.app',
  //   path: '/'
  // });
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
    domain: '.vercel.app',
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