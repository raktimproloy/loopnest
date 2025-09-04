import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { AdminServices } from "./admin.service";
import { StudentServices } from "../student/student.service";
import httpStatus from "http-status";

const registerAdmin = catchAsync(async (req, res) => {
  const result = await AdminServices.registerAdmin(req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin registered successfully",
    data: result,
  });
});

const loginAdmin = catchAsync(async (req, res) => {
  const result = await AdminServices.loginAdmin(req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin login successful",
    data: result,
  });
});

const getProfile = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await AdminServices.getAdminProfile(req.admin.adminId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin profile fetched successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await AdminServices.updateAdminProfile(req.admin.adminId, req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin profile updated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await AdminServices.changeAdminPassword(
    req.admin.adminId, 
    req.body.currentPassword, 
    req.body.newPassword
  );
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const getAllAdmins = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await AdminServices.getAllAdmins(req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admins fetched successfully",
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await AdminServices.deleteAdmin(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// Student Management Controllers (Admin Only)
const getAllStudents = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await StudentServices.getAllStudents(req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Students fetched successfully",
    data: result,
  });
});

const getStudentById = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await StudentServices.getStudentById(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student fetched successfully",
    data: result,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await StudentServices.updateStudentByAdmin(req.params.id, req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student updated successfully",
    data: result,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  if (!req.admin?.adminId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Admin not authenticated',
      errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
    });
  }

  const result = await StudentServices.deleteStudentByAdmin(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const adminController = {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
  getAllAdmins,
  deleteAdmin,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
