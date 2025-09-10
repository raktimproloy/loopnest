import { model, Schema } from "mongoose";
import { TBlog } from "./blog.interface";

const blogSchema = new Schema<TBlog>({
  title: { 
    type: String, 
    required: [true, "Title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  content: { 
    type: String, 
    required: [true, "Content is required"],
    trim: true
  },
  excerpt: { 
    type: String, 
    required: [true, "Excerpt is required"],
    trim: true,
    maxlength: [500, "Excerpt cannot exceed 500 characters"]
  },
  featuredImage: { 
    type: String, 
    required: [true, "Featured image is required"]
  },
  readTime: { 
    type: Number, 
    required: [true, "Read time is required"],
    min: [1, "Read time must be at least 1 minute"]
  },
  publishDate: { 
    type: Date, 
    required: [true, "Publish date is required"],
    default: Date.now
  },
  slug: { 
    type: String, 
    unique: true,
    lowercase: true,
    trim: true
  },
  author: {
    name: { 
      type: String, 
      required: [true, "Author name is required"],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, "Author email is required"],
      trim: true,
      lowercase: true
    },
    avatar: { 
      type: String,
      trim: true
    }
  },
  tags: [{ 
    type: String, 
    trim: true,
    lowercase: true
  }],
  category: { 
    type: String, 
    required: [true, "Category is required"],
    trim: true
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  views: { 
    type: Number, 
    default: 0,
    min: 0
  },
  likes: { 
    type: Number, 
    default: 0,
    min: 0
  },
  seoTitle: { 
    type: String,
    trim: true,
    maxlength: [60, "SEO title cannot exceed 60 characters"]
  },
  seoDescription: { 
    type: String,
    trim: true,
    maxlength: [160, "SEO description cannot exceed 160 characters"]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, isDeleted: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ publishDate: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ likes: -1 });

// Virtual for reading time calculation
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to generate slug
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const Blog = model<TBlog>("Blog", blogSchema);
