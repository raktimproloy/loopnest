import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { StudentServices } from "./student.service";
import config from "../../config";

// Build cookie options that work on localhost and any *.vercel.app domain
const getCookieOptions = (req: any) => {
  const isProd = config.node_env === 'production';
  const origin = req.headers?.origin as string | undefined;
  let host: string | undefined;
  try {
    if (origin) host = new URL(origin).hostname;
  } catch (_e) {
    // ignore
  }
  host = host || req.hostname;

  let domain: string | undefined;
  const isVercel = !!(host && /\.vercel\.app$/i.test(host));
  if (isVercel) {
    domain = '.vercel.app';
  } else if (host === 'localhost' || host === '127.0.0.1') {
    domain = undefined; // required for localhost cookies to set properly
  }

  const base = {
    httpOnly: true,
    secure: isProd || isVercel,
    sameSite: (isVercel || isProd) ? 'none' : 'lax',
    path: '/',
  } as any;
  if (domain) base.domain = domain;
  return base;
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

  const cookieOptions = getCookieOptions(req);

  // 7d for access, 30d for refresh
  res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: { student: result.student },
  });
});

const socialLogin = catchAsync(async (req, res) => {
  const result = await StudentServices.socialLoginStudent(req.body);

  const cookieOptions = getCookieOptions(req);

  res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Social login successful",
    data: { student: result.student },
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
  const refreshTokenCookie = (req as any).cookies?.refreshToken as string | undefined;
  const tokenToUse = req.body.refreshToken || refreshTokenCookie || '';
  const result = await StudentServices.refreshAccessToken(tokenToUse);

  const cookieOptions = getCookieOptions(req);

  res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: { accessToken: result.accessToken },
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
    const cookieOptions = getCookieOptions(req);

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

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
