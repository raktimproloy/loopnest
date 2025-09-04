import { model, Schema } from "mongoose";
import { TBlog } from "./blog.interface";

const blogSchema = new Schema<TBlog>({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  featuredImage: { type: String, required: true },
  readTime: { type: String, required: true },
  publishDate: { type: String, required: true },
  slug: { type: String },
  userId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Blog = model<TBlog>("Blog", blogSchema);
