import { z } from "zod";

const adminRegisterValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["super_admin", "admin", "moderator"], {
      message: "Role must be super_admin, admin, or moderator"
    }),
    permissions: z.array(z.string()).min(1, "At least one permission is required"),
  }),
  cookies: z.object({}).optional(),
});

const adminLoginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
  cookies: z.object({}).optional(),
});

const adminUpdateValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    role: z.enum(["super_admin", "admin", "moderator"]).optional(),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
  cookies: z.object({}).optional(),
});

const adminChangePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  }),
  cookies: z.object({}).optional(),
});

// Student Management Validation Schemas
const updateStudentValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    status: z.enum(["active", "inactive", "blocked"]).optional(),
    emailVerified: z.boolean().optional(),
    profileImage: z.string().url("Invalid profile image URL").optional(),
  }),
  cookies: z.object({}).optional(),
});

export const AdminValidation = {
  adminRegisterValidationSchema,
  adminLoginValidationSchema,
  adminUpdateValidationSchema,
  adminChangePasswordValidationSchema,
  updateStudentValidationSchema,
};
