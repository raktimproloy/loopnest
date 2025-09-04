export type TStudent = {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  registrationType: 'manual' | 'google' | 'facebook';
  emailVerified: boolean;
  otpCode?: string;
  otpExpire?: Date;
  status: 'active' | 'inactive' | 'blocked';
  profileImage?: string;
  googleId?: string;
  facebookId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

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
  registrationType: string;
};
