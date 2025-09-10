import { z } from "zod";

const createBlogValidationSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters")
      .trim(),
    content: z.string()
      .min(1, "Content is required")
      .trim(),
    excerpt: z.string()
      .min(1, "Excerpt is required")
      .max(500, "Excerpt cannot exceed 500 characters")
      .trim(),
    featuredImage: z.string()
      .min(1, "Featured image is required")
      .url("Featured image must be a valid URL"),
    readTime: z.number()
      .min(1, "Read time must be at least 1 minute")
      .max(120, "Read time cannot exceed 120 minutes"),
    publishDate: z.string()
      .optional()
      .transform((val) => val ? new Date(val) : new Date()),
    author: z.object({
      name: z.string()
        .min(1, "Author name is required")
        .max(100, "Author name cannot exceed 100 characters")
        .trim(),
      email: z.string()
        .email("Invalid email format")
        .trim()
        .toLowerCase(),
      avatar: z.string()
        .url("Avatar must be a valid URL")
        .optional()
        .or(z.literal("")),
    }),
    tags: z.array(z.string().trim().toLowerCase())
      .min(1, "At least one tag is required")
      .max(10, "Cannot have more than 10 tags"),
    category: z.string()
      .min(1, "Category is required")
      .max(50, "Category cannot exceed 50 characters")
      .trim(),
    status: z.enum(["draft", "published", "archived"])
      .optional()
      .default("draft"),
    seoTitle: z.string()
      .max(60, "SEO title cannot exceed 60 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    seoDescription: z.string()
      .max(160, "SEO description cannot exceed 160 characters")
      .trim()
      .optional()
      .or(z.literal("")),
  }),
  cookies: z.object({}).optional(),
});

const updateBlogValidationSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters")
      .trim()
      .optional(),
    content: z.string()
      .min(1, "Content is required")
      .trim()
      .optional(),
    excerpt: z.string()
      .min(1, "Excerpt is required")
      .max(500, "Excerpt cannot exceed 500 characters")
      .trim()
      .optional(),
    featuredImage: z.string()
      .min(1, "Featured image is required")
      .url("Featured image must be a valid URL")
      .optional(),
    readTime: z.number()
      .min(1, "Read time must be at least 1 minute")
      .max(120, "Read time cannot exceed 120 minutes")
      .optional(),
    publishDate: z.string()
      .transform((val) => new Date(val))
      .optional(),
    author: z.object({
      name: z.string()
        .min(1, "Author name is required")
        .max(100, "Author name cannot exceed 100 characters")
        .trim(),
      email: z.string()
        .email("Invalid email format")
        .trim()
        .toLowerCase(),
      avatar: z.string()
        .url("Avatar must be a valid URL")
        .optional()
        .or(z.literal("")),
    }).optional(),
    tags: z.array(z.string().trim().toLowerCase())
      .min(1, "At least one tag is required")
      .max(10, "Cannot have more than 10 tags")
      .optional(),
    category: z.string()
      .min(1, "Category is required")
      .max(50, "Category cannot exceed 50 characters")
      .trim()
      .optional(),
    status: z.enum(["draft", "published", "archived"])
      .optional(),
    seoTitle: z.string()
      .max(60, "SEO title cannot exceed 60 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    seoDescription: z.string()
      .max(160, "SEO description cannot exceed 160 characters")
      .trim()
      .optional()
      .or(z.literal("")),
  }),
  cookies: z.object({}).optional(),
});

const getBlogsValidationSchema = z.object({
  query: z.object({
    page: z.string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 1)
      .refine((val) => val > 0, "Page must be greater than 0"),
    limit: z.string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 10)
      .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
    searchTerm: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    author: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(["title", "publishDate", "views", "likes", "createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
  cookies: z.object({}).optional(),
});

export const BlogValidation = {
  createBlogValidationSchema,
  updateBlogValidationSchema,
  getBlogsValidationSchema,
};
