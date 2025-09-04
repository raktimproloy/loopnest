import express from "express";
import { studentController } from "./student.controller";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { StudentValidation } from "./student.validation";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateRequest(StudentValidation.manualRegisterValidationSchema),
  studentController.manualRegister
);

router.post(
  "/login",
  validateRequest(StudentValidation.loginValidationSchema),
  studentController.login
);

router.post(
  "/social-login",
  validateRequest(StudentValidation.socialLoginValidationSchema),
  studentController.socialLogin
);

router.post(
  "/verify-otp",
  validateRequest(StudentValidation.verifyOTPValidationSchema),
  studentController.verifyOTP
);

router.post(
  "/resend-otp",
  validateRequest(StudentValidation.resendOTPValidationSchema),
  studentController.resendOTP
);

router.post(
  "/refresh-token",
  validateRequest(StudentValidation.refreshTokenValidationSchema),
  studentController.refreshToken
);

// Protected routes
router.get(
  "/profile",
  auth(),
  studentController.getProfile
);

router.put(
  "/profile",
  auth(),
  validateRequest(StudentValidation.updateProfileValidationSchema),
  studentController.updateProfile
);

export const StudentRoutes = router;
