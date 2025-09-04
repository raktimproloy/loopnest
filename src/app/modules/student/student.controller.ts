import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { StudentServices } from "./student.service";
import httpStatus from "http-status";

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
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: result,
  });
});

const socialLogin = catchAsync(async (req, res) => {
  const result = await StudentServices.socialLoginStudent(req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Social login successful",
    data: result,
  });
});

const verifyOTP = catchAsync(async (req, res) => {
  const result = await StudentServices.verifyOTP(req.body.email, req.body.otpCode);
  
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
  const result = await StudentServices.refreshAccessToken(req.body.refreshToken);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: result,
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
};
