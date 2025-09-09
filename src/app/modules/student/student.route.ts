import express from "express";
import { studentController } from "./student.controller";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";
import { StudentValidation } from "./student.validation";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer setup for profile image uploads
// Ensure target directory exists
import fs from "fs";
const ensureUploadDir = () => {
  const dir = path.join(process.cwd(), "public", "uploads", "profile");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const storage = multer.diskStorage({
  destination: (req: express.Request, file: any, cb: (error: any, destination: string) => void) => {
    cb(null, ensureUploadDir());
  },
  filename: (req: express.Request, file: any, cb: (error: any, filename: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomPart = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
    const userId = (req as any).user?.userId || "anon";
    cb(null, `profile_${userId}_${randomPart}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req: express.Request, file: any, cb: multer.FileFilterCallback) => {
  if (/^image\/(png|jpe?g|webp)$/i.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter });

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
// 
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

router.put(
  "/profile/image",
  auth(),
  upload.single("image"),
  studentController.updateProfileImage
);

router.post(
  "/logout",
  studentController.logout
);

export const StudentRoutes = router;
