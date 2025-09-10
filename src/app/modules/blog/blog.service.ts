import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { BlogSearchableFields, BlogFilterableFields, BlogSortableFields } from "./blog.constant";
import { TBlog, TBlogFilters } from "./blog.interface";
import { Blog } from "./blog.model";
import httpStatus from "http-status";

export const createBlogIntoDb = async (payload: TBlog) => {
  // Check if blog with same title already exists
  const isExistBlog = await Blog.findOne({
    title: payload.title,
    isDeleted: false,
  });

  if (isExistBlog) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Blog with this title already exists"
    );
  }

  // Check if slug already exists
  if (payload.slug) {
    const isExistSlug = await Blog.findOne({
      slug: payload.slug,
      isDeleted: false,
    });

    if (isExistSlug) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Blog with this slug already exists"
      );
    }
  }

  // Create new blog
  const newBlog = await Blog.create(payload);
  return newBlog;
};

export const getAllBlogsFromDb = async (query: Record<string, unknown>) => {
  const blogQuery = new QueryBuilder(Blog.find({ isDeleted: false }), query)
    .search(BlogSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery.exec();

  const { page, limit, total, totalPage } = await blogQuery.countTotal();
  return {
    meta: { page, limit, total, totalPage },
    data: result,
  };
};

// Public API - Get published blogs only
export const getPublishedBlogsFromDb = async (query: Record<string, unknown>) => {
  const baseQuery = Blog.find({ 
    isDeleted: false, 
    status: 'published' 
  });

  const blogQuery = new QueryBuilder(baseQuery, query)
    .search(BlogSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery.exec();

  const { page, limit, total, totalPage } = await blogQuery.countTotal();
  return {
    meta: { page, limit, total, totalPage },
    data: result,
  };
};

// Get single blog by ID
const getSingleBlogFromDb = async (id: string) => {
  const result = await Blog.findOne({ _id: id, isDeleted: false });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

// Get single published blog by ID (public API)
export const getPublishedBlogFromDb = async (id: string) => {
  const result = await Blog.findOne({ 
    _id: id, 
    isDeleted: false, 
    status: 'published' 
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

// Get single blog by slug (public API)
export const getBlogBySlugFromDb = async (slug: string) => {
  const result = await Blog.findOne({ 
    slug, 
    isDeleted: false, 
    status: 'published' 
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

// Increment blog views
export const incrementBlogViews = async (id: string) => {
  const result = await Blog.findByIdAndUpdate(
    { _id: id, isDeleted: false },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

// Like/Unlike blog
export const toggleBlogLike = async (id: string) => {
  const blog = await Blog.findOne({ _id: id, isDeleted: false });
  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  // For now, just increment likes. In a real app, you'd track user likes
  const result = await Blog.findByIdAndUpdate(
    { _id: id },
    { $inc: { likes: 1 } },
    { new: true }
  );
  return result;
};

// Get blog statistics
export const getBlogStatsFromDb = async () => {
  const stats = await Blog.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalBlogs: { $sum: 1 },
        publishedBlogs: {
          $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] }
        },
        draftBlogs: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] }
        },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: "$likes" },
        avgReadTime: { $avg: "$readTime" }
      }
    }
  ]);

  const categoryStats = await Blog.aggregate([
    { $match: { isDeleted: false, status: "published" } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalViews: { $sum: "$views" }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const tagStats = await Blog.aggregate([
    { $match: { isDeleted: false, status: "published" } },
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  return {
    overview: stats[0] || {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      totalViews: 0,
      totalLikes: 0,
      avgReadTime: 0
    },
    categoryStats,
    tagStats
  };
};

// Get related blogs
export const getRelatedBlogsFromDb = async (blogId: string, limit: number = 5) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  const relatedBlogs = await Blog.find({
    _id: { $ne: blogId },
    isDeleted: false,
    status: 'published',
    $or: [
      { category: blog.category },
      { tags: { $in: blog.tags } }
    ]
  })
  .sort({ publishDate: -1 })
  .limit(limit)
  .select('title slug excerpt featuredImage publishDate readTime author category tags');

  return relatedBlogs;
};

// Get popular blogs
export const getPopularBlogsFromDb = async (limit: number = 10) => {
  const popularBlogs = await Blog.find({
    isDeleted: false,
    status: 'published'
  })
  .sort({ views: -1, likes: -1 })
  .limit(limit)
  .select('title slug excerpt featuredImage publishDate readTime author views likes');

  return popularBlogs;
};

// Get recent blogs
export const getRecentBlogsFromDb = async (limit: number = 10) => {
  const recentBlogs = await Blog.find({
    isDeleted: false,
    status: 'published'
  })
  .sort({ publishDate: -1 })
  .limit(limit)
  .select('title slug excerpt featuredImage publishDate readTime author category tags');

  return recentBlogs;
};

// Soft delete blog
const deleteBlogFromDb = async (id: string) => {
  const result = await Blog.findByIdAndUpdate(
    { _id: id, isDeleted: false }, 
    { isDeleted: true, status: 'archived' },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

// Update blog
const updateBlogIntoDb = async (id: string, payload: Partial<TBlog>) => {
  // Check if title is being updated and if it already exists
  if (payload.title) {
    const isExistBlog = await Blog.findOne({
      title: payload.title,
      _id: { $ne: id },
      isDeleted: false,
    });

    if (isExistBlog) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Blog with this title already exists"
      );
    }
  }

  // Check if slug is being updated and if it already exists
  if (payload.slug) {
    const isExistSlug = await Blog.findOne({
      slug: payload.slug,
      _id: { $ne: id },
      isDeleted: false,
    });

    if (isExistSlug) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Blog with this slug already exists"
      );
    }
  }

  const result = await Blog.findByIdAndUpdate(
    { _id: id, isDeleted: false }, 
    payload, 
    { new: true, runValidators: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

// Publish blog
export const publishBlogFromDb = async (id: string) => {
  const result = await Blog.findByIdAndUpdate(
    { _id: id, isDeleted: false },
    { status: 'published', publishDate: new Date() },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

// Unpublish blog
export const unpublishBlogFromDb = async (id: string) => {
  const result = await Blog.findByIdAndUpdate(
    { _id: id, isDeleted: false },
    { status: 'draft' },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return result;
};

export const BlogServices = {
  createBlogIntoDb,
  getAllBlogsFromDb,
  getPublishedBlogsFromDb,
  getSingleBlogFromDb,
  getPublishedBlogFromDb,
  getBlogBySlugFromDb,
  incrementBlogViews,
  toggleBlogLike,
  getBlogStatsFromDb,
  getRelatedBlogsFromDb,
  getPopularBlogsFromDb,
  getRecentBlogsFromDb,
  deleteBlogFromDb,
  updateBlogIntoDb,
  publishBlogFromDb,
  unpublishBlogFromDb,
};
