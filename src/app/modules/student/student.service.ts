import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import { TLoginCredentials, TSocialLoginData, TStudent } from './student.interface';
import { Student } from './student.model';
import httpStatus from 'http-status';
import { createAccessToken, createRefreshToken } from '../../../utils/jwt';
import { generateOTP, sendOTPEmail } from '../../../utils/emailService';

export const manualRegisterStudent = async (payload: Partial<TStudent>) => {
  // Check if student already exists
  const existingStudent = await Student.findOne({
    email: payload.email,
    isDeleted: false,
  });

  if (existingStudent) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Student with this email already exists"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password!, 12);

  // Generate OTP
  const otpCode = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create student
  const newStudent = await Student.create({
    ...payload,
    password: hashedPassword,
    registrationType: 'manual',
    emailVerified: false,
    otpCode,
    otpExpire,
    status: 'active',
  });

  // Send OTP email
  const emailResult = await sendOTPEmail(payload.email!, otpCode, payload.fullName!);
  if (!emailResult.success) {
    // If email fails, still create user but log the issue
    // Email sending failed, but continue with OTP generation
  }

  // Remove sensitive data
  const { password, otpCode: _, otpExpire: __, ...studentWithoutSensitiveData } = newStudent.toObject();

  return studentWithoutSensitiveData;
};

export const loginStudent = async (credentials: TLoginCredentials) => {
  // Find student
  const student = await Student.findOne({
    email: credentials.email,
    isDeleted: false,
    status: 'active',
  });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  // Check if email is verified
  if (!student.emailVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please verify your email first"
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(credentials.password, student.password!);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  // Update last login
  await Student.findByIdAndUpdate(student._id, { lastLogin: new Date() });

  // Generate tokens
  const jwtPayload = {
    userId: student._id.toString(),
    email: student.email,
    registrationType: student.registrationType,
  };

  const accessToken = createAccessToken(jwtPayload);
  const refreshToken = createRefreshToken(jwtPayload);

  // Remove sensitive data
  const { password, otpCode, otpExpire, ...studentWithoutSensitiveData } = student.toObject();

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
      registrationType: socialData.registrationType,
      emailVerified: true, // Social logins are pre-verified
      status: 'active',
      [socialData.registrationType === 'google' ? 'googleId' : 'facebookId']: socialData.socialId,
      lastLogin: new Date(),
    });
  }

  // Generate tokens
  const jwtPayload = {
    userId: student!._id.toString(),
    email: student!.email,
    registrationType: student!.registrationType,
  };

  const accessToken = createAccessToken(jwtPayload);
  const refreshToken = createRefreshToken(jwtPayload);

  // Remove sensitive data
  const { password, otpCode, otpExpire, ...studentWithoutSensitiveData } = student!.toObject();

  return {
    student: studentWithoutSensitiveData,
    accessToken,
    refreshToken,
  };
};

export const verifyOTP = async (email: string, otpCode: string) => {
  const student = await Student.findOne({
    email,
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
  const emailResult = await sendOTPEmail(email, otpCode, student.fullName);
  if (!emailResult.success) {
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
    const jwtPayload = {
      userId: student._id.toString(),
      email: student.email,
      registrationType: student.registrationType,
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
  const allowedFields = ['fullName', 'email', 'phone', 'status', 'emailVerified', 'profileImage'];
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
};
