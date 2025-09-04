import express from "express";
import { courseController } from "./course.controller";
import validateRequest from "../../middleware/validateRequest";
import { CourseValidation } from "./course.validation";
import { adminAuth } from "../../middleware/adminAuth";

const router = express.Router();

// Public routes
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.get("/slug/:slug", courseController.getCourseBySlug);

// Protected routes (Admin only)
router.post(
  "/",
  adminAuth(),
  validateRequest(CourseValidation.createCourseValidationSchema),
  courseController.createCourse
);

router.put(
  "/:id",
  adminAuth(),
  validateRequest(CourseValidation.updateCourseValidationSchema),
  courseController.updateCourse
);

router.delete(
  "/:id",
  adminAuth(),
  courseController.deleteCourse
);

export const CourseRoutes = router;
