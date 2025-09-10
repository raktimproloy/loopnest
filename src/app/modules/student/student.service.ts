import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import { TJWTPayload, TLoginCredentials, TSocialLoginData, TStudent } from './student.interface';
import { Student } from './student.model';
import httpStatus from 'http-status';
import { createAccessToken, createRefreshToken } from '../../../utils/jwt';
import { generateOTP, sendOTPEmail } from '../../../utils/emailService';
import fs from 'fs';
import path from 'path';
import config from '../../config';

// Database connection check helper
const checkDatabaseConnection = () => {
  const mongoose = require('mongoose');
  const connectionState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  console.log(`[DATABASE] Connection state: ${states[connectionState as keyof typeof states]} (${connectionState})`);
  
  if (connectionState !== 1) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, 'Database connection is not ready. Please try again.');
  }
};

// Database operation retry helper
const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: any = null;
  
  // Check database connection before attempting operation
  checkDatabaseConnection();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DATABASE] Attempt ${attempt}/${maxRetries} - ${operationName}`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.log(`[DATABASE] ❌ Attempt ${attempt}/${maxRetries} failed for ${operationName}:`, error.message);
      
      // Check if it's a timeout or connection error
      if (error.message?.includes('buffering timed out') || 
          error.message?.includes('connection') ||
          error.message?.includes('timeout') ||
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND')) {
        
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // Exponential backoff
          console.log(`[DATABASE] Retrying ${operationName} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If it's not a retryable error or we're out of retries, throw
      throw error;
    }
  }
  
  throw lastError;
};

export const manualRegisterStudent = async (payload: Partial<TStudent> & { auth_input?: string }) => {
  // Normalize and classify auth input strictly as email or phone
  const authInputRaw = (payload.auth_input || '').trim();
  const isEmailInput = /@/.test(authInputRaw);
  // Prefer explicit fields when provided, otherwise derive from auth_input
  const normalizedEmail = (payload.email?.trim() || (isEmailInput ? authInputRaw : undefined))?.toLowerCase();
  const normalizedPhone = (payload.phone?.trim() || (!isEmailInput ? authInputRaw : undefined))
    ?.replace(/\s|\-|\(|\)/g, '');

  // Debug: show how auth_input is being interpreted
  // eslint-disable-next-line no-console
  console.log('[student.register] auth_input parsed', {
    authInputRaw,
    isEmailInput,
    normalizedEmail,
    normalizedPhone,
  });

  // Build a clean creation payload (avoid unintended fields like empty strings)
  const creationData: Partial<TStudent> = {
    fullName: payload.fullName,
    role: 'student',
    registrationType: 'manual',
    email: normalizedEmail,
    phone: normalizedPhone,
  };

  // Remove undefined keys explicitly
  if (!creationData.email) delete (creationData as any).email;
  if (!creationData.phone) delete (creationData as any).phone;

  // Existence checks per-field to ensure accurate messaging
  if (creationData.email) {
    const existingByEmail = await retryDatabaseOperation(
      () => Student.findOne({ email: creationData.email, isDeleted: false }),
      'findOne by email'
    );
    if (existingByEmail) {
      // eslint-disable-next-line no-console
      console.log('[student.register] existingStudent found by email', { email: creationData.email });
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'A user with this email already exists. Please use a different email.'
      );
    }
  }

  if (creationData.phone) {
    const existingByPhone = await retryDatabaseOperation(
      () => Student.findOne({ phone: creationData.phone, isDeleted: false }),
      'findOne by phone'
    );
    if (existingByPhone) {
      // eslint-disable-next-line no-console
      console.log('[student.register] existingStudent found by phone', { phone: creationData.phone });
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'A user with this phone number already exists. Please use a different number.'
      );
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password!, 12);

  // Generate OTP if email provided (email-based verification)
  const otpEnabled = !!creationData.email;
  const otpCode = otpEnabled ? generateOTP() : undefined;
  const otpExpire = otpEnabled
    ? new Date(Date.now() + 10 * 60 * 1000)
    : undefined; // 10 minutes

  // Create student
  let newStudent;
  try {
    newStudent = await retryDatabaseOperation(
      () => Student.create({
        ...creationData,
        password: hashedPassword,
        registrationType: 'manual',
        emailVerified: otpEnabled ? false : true,
        otpCode,
        otpExpire,
        status: 'active',
      }),
      'create student'
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      // Determine duplicate field from error or payload
      const keyPattern = error?.keyPattern || {};
      const keyValue = error?.keyValue || {};
      const indexNameMatch = error?.message?.match(/index: (\w+)_\d+/);
      const indexName = indexNameMatch && indexNameMatch[1];
      const fieldFromKey = Object.keys(keyPattern)[0] || Object.keys(keyValue)[0] || indexName;

      const duplicateField = fieldFromKey?.includes('phone')
        ? 'phone'
        : fieldFromKey?.includes('email')
        ? 'email'
        : creationData.phone
        ? 'phone'
        : 'email';

      const message = duplicateField === 'phone'
        ? 'A user with this phone number already exists. Please use a different number.'
        : 'A user with this email already exists. Please use a different email.';

      throw new AppError(httpStatus.BAD_REQUEST, message);
    }
    throw error;
  }

  // Send OTP email only if email present
  if (otpEnabled) {
    console.log(`[STUDENT REGISTER] Sending OTP email to: ${creationData.email}`);
    const emailResult = await sendOTPEmail(creationData.email!, otpCode!, payload.fullName!);
    
    if (emailResult.success) {
      console.log(`[STUDENT REGISTER] ✅ OTP email sent successfully to ${creationData.email}`);
      console.log(`[STUDENT REGISTER] Message ID: ${emailResult.messageId}`);
    } else {
      console.log(`[STUDENT REGISTER] ❌ Failed to send OTP email to ${creationData.email}`);
      console.log(`[STUDENT REGISTER] Email error:`, emailResult.error);
      console.log(`[STUDENT REGISTER] Email details:`, emailResult.details);
      // Email sending failed, but continue with OTP generation
    }
  } else {
    console.log(`[STUDENT REGISTER] No email provided, skipping OTP email sending`);
  }

  // Remove sensitive data
  const { password, otpCode: _otp, otpExpire: _otpExpire, ...studentWithoutSensitiveData } = newStudent.toObject();

  // For now, include OTP in response when email verification is enabled
  const responseData = otpEnabled
    ? { ...studentWithoutSensitiveData, otpCode }
    : studentWithoutSensitiveData;

  return responseData;
};

export const loginStudent = async (credentials: TLoginCredentials | { auth_input: string; password: string }) => {
  const identifier = (credentials as any).auth_input ?? (credentials as any).identifier ?? (credentials as any).email;
  const password = (credentials as any).password;

  // Decide if identifier is email or phone
  const isEmail = /@/.test(identifier);

  // Find student by email or phone
  const student = await retryDatabaseOperation(
    () => Student.findOne({
      ...(isEmail ? { email: identifier } : { phone: identifier }),
      isDeleted: false,
      status: 'active',
    }),
    'findOne for login'
  );

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Check email verification only if email-based account
  if (student.email && !student.emailVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please verify your email first"
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, student.password!);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  // Update last login
  await Student.findByIdAndUpdate(student._id, { lastLogin: new Date() });

  // Generate tokens
  const jwtPayload: TJWTPayload = {
    userId: student._id.toString(),
    email: student.email || '',
    registrationType: student.registrationType,
    role: student.role,
  };

  const accessToken = createAccessToken(jwtPayload);
  const refreshToken = createRefreshToken(jwtPayload);

  // Remove sensitive data (alias to avoid name collision with local 'password')
  const { password: _password, otpCode: _otpCode, otpExpire: _otpExpire, ...studentWithoutSensitiveData } = student.toObject();

  return {
    student: studentWithoutSensitiveData,
    accessToken,
    refreshToken,
  };
};

export const socialLoginStudent = async (socialData: TSocialLoginData) => {
  // Check if student exists
  let student = await Student.findOne({
    email: socialData.email,
    isDeleted: false,
  });

  if (student) {
    // Update social ID if not exists
    const updateData: any = { lastLogin: new Date() };
    
    if (socialData.registrationType === 'google' && !student.googleId) {
      updateData.googleId = socialData.socialId;
    } else if (socialData.registrationType === 'facebook' && !student.facebookId) {
      updateData.facebookId = socialData.socialId;
    }

    await Student.findByIdAndUpdate(student._id, updateData);
    student = await Student.findById(student._id);
  } else {
    // Create new student
    student = await Student.create({
      fullName: socialData.fullName,
      email: socialData.email,
      profileImage: socialData.profileImage,
      role: 'student',
      registrationType: socialData.registrationType,
      emailVerified: true, // Social logins are pre-verified
      status: 'active',
      [socialData.registrationType === 'google' ? 'googleId' : 'facebookId']: socialData.socialId,
      lastLogin: new Date(),
    });
  }

  // Generate tokens
  const jwtPayload: TJWTPayload = {
    userId: student!._id.toString(),
    email: student!.email || '',
    registrationType: student!.registrationType,
    role: student!.role,
  };

  const accessToken = createAccessToken(jwtPayload);
  const refreshToken = createRefreshToken(jwtPayload);

  // Remove sensitive data
  const { password: _password2, otpCode: _otpCode2, otpExpire: _otpExpire2, ...studentWithoutSensitiveData } = student!.toObject();

  return {
    student: studentWithoutSensitiveData,
    accessToken,
    refreshToken,
  };
};

export const verifyOTP = async (authInput: string, otpCode: string) => {
  const isEmail = /@/.test(authInput);
  const student = await Student.findOne({
    ...(isEmail ? { email: authInput.toLowerCase() } : { phone: authInput }),
    otpCode,
    otpExpire: { $gt: new Date() },
    isDeleted: false,
  });

  if (!student) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
  }

  // Update student
  await Student.findByIdAndUpdate(student._id, {
    emailVerified: true,
    otpCode: undefined,
    otpExpire: undefined,
  });

  return { message: "Email verified successfully" };
};

export const resendOTP = async (email: string) => {
  const student = await Student.findOne({
    email,
    isDeleted: false,
  });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  if (student.emailVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email already verified");
  }

  // Generate new OTP
  const otpCode = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update student
  await Student.findByIdAndUpdate(student._id, {
    otpCode,
    otpExpire,
  });

  // Send OTP email
  console.log(`[STUDENT RESEND OTP] Sending OTP email to: ${email}`);
  const emailResult = await sendOTPEmail(email, otpCode, student.fullName);
  
  if (emailResult.success) {
    console.log(`[STUDENT RESEND OTP] ✅ OTP email sent successfully to ${email}`);
    console.log(`[STUDENT RESEND OTP] Message ID: ${emailResult.messageId}`);
  } else {
    console.log(`[STUDENT RESEND OTP] ❌ Failed to send OTP email to ${email}`);
    console.log(`[STUDENT RESEND OTP] Email error:`, emailResult.error);
    console.log(`[STUDENT RESEND OTP] Email details:`, emailResult.details);
    // Email sending failed, but continue with OTP generation
  }

  return { message: "OTP sent successfully" };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const { createAccessToken, verifyRefreshToken } = await import('../../../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    // Check if the token is for student (has userId property)
    if (!('userId' in decoded)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    // Find student
    const student = await Student.findById(decoded.userId);
    if (!student || student.isDeleted || student.status !== 'active') {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    // Generate new access token
    const jwtPayload: TJWTPayload = {
      userId: student._id.toString(),
      email: student.email || '',
      registrationType: student.registrationType,
      role: student.role,
    };

    const newAccessToken = createAccessToken(jwtPayload);

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }
};

export const getStudentProfile = async (userId: string) => {
  const student = await Student.findById(userId).select('-password -otpCode -otpExpire');
  
  if (!student || student.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  return student;
};

export const getStudentById = async (studentId: string) => {
  const student = await Student.findById(studentId).select('-password -otpCode -otpExpire');
  
  if (!student || student.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  return student;
};

export const updateStudentProfile = async (userId: string, updateData: Partial<TStudent>) => {
  // Check if student exists
  const existingStudent = await Student.findById(userId);
  if (!existingStudent || existingStudent.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Only allow updating specific fields
  const allowedFields = ['fullName', 'phone', 'profileImage'];
  const filteredUpdateData: any = {};
  
  allowedFields.forEach(field => {
    if (updateData[field as keyof TStudent] !== undefined) {
      filteredUpdateData[field] = updateData[field as keyof TStudent];
    }
  });

  // Update student profile
  const updatedStudent = await Student.findByIdAndUpdate(
    userId,
    filteredUpdateData,
    { new: true, runValidators: true }
  ).select('-password -otpCode -otpExpire');

  if (!updatedStudent) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  return updatedStudent;
};

export const getAllStudents = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10, status, emailVerified, registrationType, search } = query;
  
  // Build filter object
  const filter: any = { isDeleted: false };
  
  if (status) {
    filter.status = status;
  }
  
  if (emailVerified !== undefined) {
    filter.emailVerified = emailVerified === 'true';
  }
  
  if (registrationType) {
    filter.registrationType = registrationType;
  }
  
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Get students
  const students = await Student.find(filter)
    .select('-password -otpCode -otpExpire')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Get total count
  const total = await Student.countDocuments(filter);
  const totalPages = Math.ceil(total / Number(limit));

  return {
    students,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  };
};

export const updateStudentByAdmin = async (studentId: string, updateData: Partial<TStudent>) => {
  // Check if student exists
  const existingStudent = await Student.findById(studentId);
  if (!existingStudent || existingStudent.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Allow updating all fields except password and OTP
  const allowedFields = ['fullName', 'email', 'phone', 'status', 'emailVerified', 'profileImage', 'role'];
  const filteredUpdateData: any = {};
  
  allowedFields.forEach(field => {
    if (updateData[field as keyof TStudent] !== undefined) {
      filteredUpdateData[field] = updateData[field as keyof TStudent];
    }
  });

  // Update student
  const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    filteredUpdateData,
    { new: true, runValidators: true }
  ).select('-password -otpCode -otpExpire');

  if (!updatedStudent) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  return updatedStudent;
};

export const deleteStudentByAdmin = async (studentId: string) => {
  const student = await Student.findById(studentId);
  if (!student || student.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Soft delete
  await Student.findByIdAndUpdate(studentId, { isDeleted: true });

  return { message: "Student deleted successfully" };
};

export const updateProfileImage = async (userId: string, imageData: string) => {
  const student = await Student.findById(userId);
  if (!student || student.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Ensure upload directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile');
  fs.mkdirSync(uploadsDir, { recursive: true });

  // Parse base64 data URL or raw base64
  let base64 = imageData;
  const dataUrlMatch = imageData.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
  let ext = 'png';
  if (dataUrlMatch) {
    const mime = dataUrlMatch[1];
    base64 = dataUrlMatch[3];
    if (/jpeg|jpg/i.test(mime)) ext = 'jpg';
    else if (/png/i.test(mime)) ext = 'png';
    else if (/webp/i.test(mime)) ext = 'webp';
  }

  const randomPart = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  const filename = `profile_${userId}_${randomPart}.${ext}`;
  const filePath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(filePath, buffer);

  const baseUrl = (config.base_url || '').replace(/\/$/, '');
  const publicUrl = `${baseUrl}/public/uploads/profile/${filename}`;

  const updated = await Student.findByIdAndUpdate(
    userId,
    { profileImage: publicUrl },
    { new: true }
  ).select('-password -otpCode -otpExpire');

  return { profileImage: publicUrl, student: updated };
};

export const updateProfileImageFromDisk = async (userId: string, filename: string) => {
  const student = await Student.findById(userId);
  if (!student || student.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile');
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Uploaded file not found");
  }

  const baseUrl = (config.base_url || '').replace(/\/$/, '');
  const publicUrl = `${baseUrl}/public/uploads/profile/${filename}`;

  const updated = await Student.findByIdAndUpdate(
    userId,
    { profileImage: publicUrl },
    { new: true }
  ).select('-password -otpCode -otpExpire');

  return { profileImage: publicUrl, student: updated };
};

export const StudentServices = {
  manualRegisterStudent,
  loginStudent,
  socialLoginStudent,
  verifyOTP,
  resendOTP,
  refreshAccessToken,
  getStudentProfile,
  getStudentById,
  updateStudentProfile,
  getAllStudents,
  updateStudentByAdmin,
  deleteStudentByAdmin,
  updateProfileImage,
  updateProfileImageFromDisk,
};

// no dynamic assignment; function is included in StudentServices above
