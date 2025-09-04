import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { adminAuth, requireRole, requirePermission } from "../../middleware/adminAuth";
import { AdminValidation } from "./admin.validation";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateRequest(AdminValidation.adminRegisterValidationSchema),
  adminController.registerAdmin
);

router.post(
  "/login",
  validateRequest(AdminValidation.adminLoginValidationSchema),
  adminController.loginAdmin
);

// Protected routes - require admin authentication
router.get(
  "/profile",
  adminAuth(),
  adminController.getProfile
);

router.put(
  "/profile",
  adminAuth(),
  validateRequest(AdminValidation.adminUpdateValidationSchema),
  adminController.updateProfile
);

router.put(
  "/change-password",
  adminAuth(),
  validateRequest(AdminValidation.adminChangePasswordValidationSchema),
  adminController.changePassword
);

// Admin management routes - require super_admin or admin role
router.get(
  "/",
  adminAuth(),
  requireRole(['super_admin', 'admin']),
  adminController.getAllAdmins
);

router.delete(
  "/:id",
  adminAuth(),
  requireRole(['super_admin']),
  adminController.deleteAdmin
);

// Student Management Routes (Admin Only)
router.get(
  "/students",
  adminAuth(),
  requireRole(['super_admin', 'admin']),
  adminController.getAllStudents
);

router.get(
  "/students/:id",
  adminAuth(),
  requireRole(['super_admin', 'admin']),
  adminController.getStudentById
);

router.put(
  "/students/:id",
  adminAuth(),
  requireRole(['super_admin', 'admin']),
  validateRequest(AdminValidation.updateStudentValidationSchema),
  adminController.updateStudent
);

router.delete(
  "/students/:id",
  adminAuth(),
  requireRole(['super_admin', 'admin']),
  adminController.deleteStudent
);

export const AdminRoutes = router;
