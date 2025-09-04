import express from "express";
import { blogController } from "./blog.controller";
import validateRequest from "../../middleware/validateRequest";
import { BlogValidation } from "./blog.validation";

const router = express.Router();

router.post(
  "/create",
  validateRequest(BlogValidation.createBlogValidationSchema),
  blogController.createBlog
);

router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getSingleBlog);
router.delete("/:id", blogController.deleteBlog);
router.put(
  "/:id",
  validateRequest(BlogValidation.updateBlogValidationSchema),
  blogController.updateBlog
);

export const BlogRoutes = router;
