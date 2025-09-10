import express from "express";
import { courseController } from "./course.controller";
import validateRequest from "../../middleware/validateRequest";
import { CourseValidation } from "./course.validation";
import { adminAuth } from "../../middleware/adminAuth";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer setup for course image uploads
const ensureUploadDir = () => {
  const dir = path.join(process.cwd(), "public", "uploads", "course");
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
    cb(null, `course_${randomPart}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req: express.Request, file: any, cb: multer.FileFilterCallback) => {
  if (/^image\/(png|jpe?g|webp)$/i.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter });

// Coerce multipart form-data string fields into proper types
const parseCourseMultipartFields: express.RequestHandler = (req, _res, next) => {
  try {
    const body: any = req.body || {};
    
    // Debug logging
    console.log('[COURSE PARSER] Raw upcomingCourse value:', body.upcomingCourse, 'type:', typeof body.upcomingCourse);

    // Coerce number fields - handle boolean strings and special cases
    if (body.upcomingCourse !== undefined && body.upcomingCourse !== null) {
      if (typeof body.upcomingCourse === 'string') {
        const value = body.upcomingCourse.toLowerCase().trim();
        
        // Handle boolean strings
        if (value === 'true' || value === 'false') {
          body.upcomingCourse = value === 'true' ? 1 : 0;
        } else if (value === '' || value === 'null' || value === 'undefined') {
          // Handle empty or null strings
          body.upcomingCourse = 0;
        } else {
          // Try to convert to number
          const n = Number(body.upcomingCourse);
          if (!Number.isNaN(n)) {
            body.upcomingCourse = n;
          } else {
            // If conversion fails, default to 0
            body.upcomingCourse = 0;
          }
        }
      } else if (typeof body.upcomingCourse === 'boolean') {
        // Handle actual boolean values
        body.upcomingCourse = body.upcomingCourse ? 1 : 0;
      }
    } else {
      // If undefined or null, set to 0
      body.upcomingCourse = 0;
    }
    
    console.log('[COURSE PARSER] Processed upcomingCourse value:', body.upcomingCourse, 'type:', typeof body.upcomingCourse);

    // Helper to parse JSON arrays/objects when sent as strings
    const parseIfString = (key: string) => {
      if (typeof body[key] === 'string') {
        try {
          body[key] = JSON.parse(body[key]);
        } catch (_e) {
          // leave as-is; zod will report validation error if invalid
        }
      }
    };

    // Expected JSON fields
    ['statistics', 'instructors', 'courseFeatures', 'courseModules', 'projects'].forEach(parseIfString);

    next();
  } catch (_err) {
    next();
  }
};

// Public routes
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.get("/slug/:slug", courseController.getCourseBySlug);

// Protected routes (Admin only)
router.post(
  "/",
  adminAuth(),
  upload.single("image"),
  parseCourseMultipartFields,
  // validateRequest(CourseValidation.createCourseValidationSchema), // Validation disabled
  courseController.createCourse
);

router.put(
  "/:id",
  adminAuth(),
  upload.single("image"),
  parseCourseMultipartFields,
  // validateRequest(CourseValidation.updateCourseValidationSchema), // Validation disabled
  courseController.updateCourse
);

router.delete(
  "/:id",
  adminAuth(),
  courseController.deleteCourse
);

export const CourseRoutes = router;
