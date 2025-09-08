import express from "express";
import { blogController } from "./blog.controller";
import validateRequest from "../../middleware/validateRequest";
import { BlogValidation } from "./blog.validation";
import { adminAuth } from "../../middleware/adminAuth";

const router = express.Router();

router.post(
  "/create",
  adminAuth(),
  validateRequest(BlogValidation.createBlogValidationSchema),
  blogController.createBlog
);

router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getSingleBlog);
router.delete("/:id", adminAuth(), blogController.deleteBlog);
router.put(
  "/:id",
  adminAuth(),
  validateRequest(BlogValidation.updateBlogValidationSchema),
  blogController.updateBlog
);

export const BlogRoutes = router;
