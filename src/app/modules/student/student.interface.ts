export type TStudent = {
  fullName: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'student' | 'mentor' | 'admin';
  registrationType: 'manual' | 'google' | 'facebook';
  emailVerified: boolean;
  otpCode?: string;
  otpExpire?: Date;
  status: 'active' | 'inactive' | 'blocked';
  profileImage?: string;
  googleId?: string;
  facebookId?: string;
  lastLogin?: Date;
  activeCourses?: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

// Unified user type alias for clarity
export type TUser = TStudent;

export type TLoginCredentials = {
  email: string;
  password: string;
};

export type TSocialLoginData = {
  fullName: string;
  email: string;
  profileImage?: string;
  socialId: string;
  registrationType: 'google' | 'facebook';
};

export type TJWTPayload = {
  userId: string;
  email: string;
  role: string;
  registrationType: string;
};
