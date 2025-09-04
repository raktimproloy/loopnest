import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import { TAdmin, TAdminLoginCredentials, TAdminRegistrationData } from './admin.interface';
import { Admin } from './admin.model';
import httpStatus from 'http-status';
import { createAccessToken, createRefreshToken } from '../../../utils/jwt';

export const registerAdmin = async (payload: TAdminRegistrationData) => {
  // Check if admin already exists
  const existingAdmin = await Admin.findOne({
    email: payload.email,
    isDeleted: false,
  });

  if (existingAdmin) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Admin with this email already exists"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // Create admin
  const newAdmin = await Admin.create({
    ...payload,
    password: hashedPassword,
    isActive: true,
  });

  // Remove sensitive data
  const { password, ...adminWithoutSensitiveData } = newAdmin.toObject();

  return adminWithoutSensitiveData;
};

export const loginAdmin = async (credentials: TAdminLoginCredentials) => {
  // Find admin
  const admin = await Admin.findOne({
    email: credentials.email,
    isDeleted: false,
    isActive: true,
  });

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found or inactive");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  // Update last login
  await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

  // Generate tokens
  const jwtPayload = {
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
  };

  const accessToken = createAccessToken(jwtPayload);
  const refreshToken = createRefreshToken(jwtPayload);

  // Remove sensitive data
  const { password, ...adminWithoutSensitiveData } = admin.toObject();

  return {
    admin: adminWithoutSensitiveData,
    accessToken,
    refreshToken,
  };
};

export const getAdminProfile = async (adminId: string) => {
  const admin = await Admin.findById(adminId).select('-password');
  
  if (!admin || admin.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  return admin;
};

export const updateAdminProfile = async (adminId: string, updateData: Partial<TAdmin>) => {
  // Check if admin exists
  const existingAdmin = await Admin.findById(adminId);
  if (!existingAdmin || existingAdmin.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // Only allow updating specific fields
  const allowedFields = ['fullName', 'phone', 'role', 'permissions', 'isActive'];
  const filteredUpdateData: any = {};
  
  allowedFields.forEach(field => {
    if (updateData[field as keyof TAdmin] !== undefined) {
      filteredUpdateData[field] = updateData[field as keyof TAdmin];
    }
  });

  // Update admin profile
  const updatedAdmin = await Admin.findByIdAndUpdate(
    adminId,
    filteredUpdateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedAdmin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  return updatedAdmin;
};

export const changeAdminPassword = async (adminId: string, currentPassword: string, newPassword: string) => {
  // Find admin
  const admin = await Admin.findById(adminId);
  if (!admin || admin.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isCurrentPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await Admin.findByIdAndUpdate(adminId, { password: hashedNewPassword });

  return { message: "Password changed successfully" };
};

export const getAllAdmins = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10, role, isActive, search } = query;
  
  // Build filter object
  const filter: any = { isDeleted: false };
  
  if (role) {
    filter.role = role;
  }
  
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Get admins
  const admins = await Admin.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Get total count
  const total = await Admin.countDocuments(filter);
  const totalPages = Math.ceil(total / Number(limit));

  return {
    admins,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  };
};

export const deleteAdmin = async (adminId: string) => {
  const admin = await Admin.findById(adminId);
  if (!admin || admin.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // Soft delete
  await Admin.findByIdAndUpdate(adminId, { isDeleted: true });

  return { message: "Admin deleted successfully" };
};

export const AdminServices = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAllAdmins,
  deleteAdmin,
};
