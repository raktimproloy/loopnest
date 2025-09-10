import express from "express";
import { blogController } from "./blog.controller";
import validateRequest from "../../middleware/validateRequest";
import { BlogValidation } from "./blog.validation";
import { adminAuth } from "../../middleware/adminAuth";

const router = express.Router();

// Admin Routes (Protected)
router.post(
  "/admin/create",
  adminAuth(),
  validateRequest(BlogValidation.createBlogValidationSchema),
  blogController.createBlog
);

router.get(
  "/admin",
  adminAuth(),
  validateRequest(BlogValidation.getBlogsValidationSchema),
  blogController.getAllBlogs
);

router.get(
  "/admin/stats",
  adminAuth(),
  blogController.getBlogStats
);

router.get(
  "/admin/:id",
  adminAuth(),
  blogController.getSingleBlog
);

router.put(
  "/admin/:id",
  adminAuth(),
  validateRequest(BlogValidation.updateBlogValidationSchema),
  blogController.updateBlog
);

router.delete(
  "/admin/:id",
  adminAuth(),
  blogController.deleteBlog
);

router.patch(
  "/admin/:id/publish",
  adminAuth(),
  blogController.publishBlog
);

router.patch(
  "/admin/:id/unpublish",
  adminAuth(),
  blogController.unpublishBlog
);

// Public Routes (No Authentication Required)
router.get(
  "/public",
  validateRequest(BlogValidation.getBlogsValidationSchema),
  blogController.getPublishedBlogs
);

router.get(
  "/public/popular",
  blogController.getPopularBlogs
);

router.get(
  "/public/recent",
  blogController.getRecentBlogs
);

router.get(
  "/public/:id",
  blogController.getPublishedBlog
);

router.get(
  "/public/slug/:slug",
  blogController.getBlogBySlug
);

router.get(
  "/public/:id/related",
  blogController.getRelatedBlogs
);

router.post(
  "/public/:id/like",
  blogController.likeBlog
);

// Legacy routes for backward compatibility
router.get("/", blogController.getPublishedBlogs);
router.get("/:id", blogController.getPublishedBlog);

export const BlogRoutes = router;
