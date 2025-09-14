import express from "express";
import { couponController } from "./coupon.controller";
import validateRequest from "../../middleware/validateRequest";
import { CouponValidation } from "./coupon.validation";
import { adminAuth } from "../../middleware/adminAuth";
import auth from "../../middleware/auth";

const router = express.Router();

// Public routes (for students to check coupon details)
router.get("/code/:cuponCode", couponController.getCouponByCode);

// Protected routes (Admin only)
router.post(
  "/",
  adminAuth(),
  validateRequest(CouponValidation.createCouponValidationSchema),
  couponController.createCoupon
);

router.get(
  "/",
  adminAuth(),
  // validateRequest(CouponValidation.getCouponsValidationSchema), // Validation disabled to match existing pattern
  couponController.getAllCoupons
);

router.get(
  "/:id",
  adminAuth(),
  // validateRequest(CouponValidation.getCouponByIdValidationSchema), // Validation disabled to match existing pattern
  couponController.getCouponById
);

router.put(
  "/:id",
  adminAuth(),
  validateRequest(CouponValidation.updateCouponValidationSchema),
  couponController.updateCoupon
);

router.patch(
  "/:id/status",
  adminAuth(),
  validateRequest(CouponValidation.updateCouponStatusValidationSchema),
  couponController.updateCouponStatus
);

router.delete(
  "/:id",
  adminAuth(),
  // validateRequest(CouponValidation.deleteCouponValidationSchema), // Validation disabled to match existing pattern
  couponController.deleteCoupon
);

// Protected routes (Student only)
router.post(
  "/use",
  auth(),
  validateRequest(CouponValidation.useCouponValidationSchema),
  couponController.useCoupon
);

export const CouponRoutes = router;
