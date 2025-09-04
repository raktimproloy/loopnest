export type TAdmin = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

export type TAdminLoginCredentials = {
  email: string;
  password: string;
};

export type TAdminJWTPayload = {
  adminId: string;
  email: string;
  role: string;
  permissions: string[];
};

export type TAdminRegistrationData = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
};
