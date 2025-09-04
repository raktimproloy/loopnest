import { z } from "zod";

const manualRegisterValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  cookies: z.object({}).optional(),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
  cookies: z.object({}).optional(),
});

const socialLoginValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    profileImage: z.string().optional(),
    socialId: z.string().min(1, "Social ID is required"),
    registrationType: z.enum(["google", "facebook"]),
  }),
  cookies: z.object({}).optional(),
});

const verifyOTPValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otpCode: z.string().length(6, "OTP must be 6 digits"),
  }),
  cookies: z.object({}).optional(),
});

const resendOTPValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
  cookies: z.object({}).optional(),
});

const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
  cookies: z.object({}).optional(),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    profileImage: z.string().url("Invalid profile image URL").optional(),
  }),
  cookies: z.object({}).optional(),
});

export const StudentValidation = {
  manualRegisterValidationSchema,
  loginValidationSchema,
  socialLoginValidationSchema,
  verifyOTPValidationSchema,
  resendOTPValidationSchema,
  refreshTokenValidationSchema,
  updateProfileValidationSchema,
};
