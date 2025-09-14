import { z } from "zod";

const createCouponValidationSchema = z.object({
  body: z.object({
    cuponCode: z.string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code cannot exceed 20 characters")
      .regex(/^[A-Z0-9]+$/, "Coupon code can only contain uppercase letters and numbers"),
    discountType: z.enum(['percentage', 'amount']),
    discountValue: z.number()
      .min(0, "Discount value cannot be negative")
      .max(999999, "Discount value is too high"),
    usageLimit: z.number()
      .min(1, "Usage limit must be at least 1")
      .max(999999, "Usage limit is too high")
      .optional(),
    expiryDate: z.string()
      .datetime("Invalid expiry date format")
      .refine((date) => new Date(date) > new Date(), {
        message: "Expiry date must be in the future"
      }),
    courseId: z.string()
      .min(1, "Course ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
    status: z.enum(['active', 'inactive']).optional(),
  }),
  cookies: z.object({}).optional(),
});

const updateCouponValidationSchema = z.object({
  body: z.object({
    cuponCode: z.string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code cannot exceed 20 characters")
      .regex(/^[A-Z0-9]+$/, "Coupon code can only contain uppercase letters and numbers")
      .optional(),
    discountType: z.enum(['percentage', 'amount']).optional(),
    discountValue: z.number()
      .min(0, "Discount value cannot be negative")
      .max(999999, "Discount value is too high")
      .optional(),
    usageLimit: z.number()
      .min(1, "Usage limit must be at least 1")
      .max(999999, "Usage limit is too high")
      .optional(),
    expiryDate: z.string()
      .datetime("Invalid expiry date format")
      .optional(),
    courseId: z.string()
      .min(1, "Course ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format")
      .optional(),
    status: z.enum(['active', 'inactive', 'expired']).optional(),
  }),
  cookies: z.object({}).optional(),
});

const updateCouponStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'inactive', 'expired']),
  }),
  cookies: z.object({}).optional(),
});

const useCouponValidationSchema = z.object({
  body: z.object({
    cuponCode: z.string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code cannot exceed 20 characters")
      .regex(/^[A-Z0-9]+$/, "Coupon code can only contain uppercase letters and numbers"),
    courseId: z.string()
      .min(1, "Course ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
  }),
  cookies: z.object({}).optional(),
});

const getCouponsValidationSchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, "Page must be a number")
      .transform(Number)
      .refine((n) => n > 0, "Page must be greater than 0")
      .optional(),
    limit: z.string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine((n) => n > 0 && n <= 100, "Limit must be between 1 and 100")
      .optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive', 'expired']).optional(),
    courseId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format")
      .optional(),
  }).optional(),
  cookies: z.object({}).optional(),
});

const getCouponByIdValidationSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, "Coupon ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid coupon ID format"),
  }).optional(),
  cookies: z.object({}).optional(),
});

const deleteCouponValidationSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, "Coupon ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid coupon ID format"),
  }).optional(),
  cookies: z.object({}).optional(),
});

export const CouponValidation = {
  createCouponValidationSchema,
  updateCouponValidationSchema,
  updateCouponStatusValidationSchema,
  useCouponValidationSchema,
  getCouponsValidationSchema,
  getCouponByIdValidationSchema,
  deleteCouponValidationSchema,
};
