import { z } from "zod";

const createBlogValidationSchema = z.object({
  body: z.object({
    title: z.string().nonempty("Title is required"),
    excerpt: z.string().nonempty("Excerpt is required"),
    featuredImage: z.string().nonempty("Featured Image is required"),
    readTime: z.string().nonempty("Read Time is required"),
    userId: z.string().nonempty("User Id is required"),
    publishDate: z.string(),
  }),
  cookies: z.object({}).optional(),
});
const updateBlogValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    excerpt: z.string().optional(),
    userId: z.string().optional(),
    featuredImage: z.string().optional(),
    readTime: z.string().optional(),
    publishDate: z.string().optional(),
  }),
  cookies: z.object({}).optional(),
});

export const BlogValidation = {
  createBlogValidationSchema,
  updateBlogValidationSchema,
};
