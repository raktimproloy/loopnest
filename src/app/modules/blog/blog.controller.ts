import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { BlogServices } from "./blog.service";
import httpStatus from "http-status";

// Admin Controllers
const createBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.createBlogIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Blog created successfully",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.getAllBlogsFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blogs fetched successfully",
    data: result,
  });
});

const getSingleBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.getSingleBlogFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

const updateBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.updateBlogIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog updated successfully",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.deleteBlogFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog deleted successfully",
    data: result,
  });
});

const publishBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.publishBlogFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog published successfully",
    data: result,
  });
});

const unpublishBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.unpublishBlogFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog unpublished successfully",
    data: result,
  });
});

const getBlogStats = catchAsync(async (req, res) => {
  const result = await BlogServices.getBlogStatsFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog statistics fetched successfully",
    data: result,
  });
});

// Public Controllers
const getPublishedBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.getPublishedBlogsFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Published blogs fetched successfully",
    data: result,
  });
});

const getPublishedBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.getPublishedBlogFromDb(req.params.id);
  // Increment views when blog is accessed
  await BlogServices.incrementBlogViews(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

const getBlogBySlug = catchAsync(async (req, res) => {
  const result = await BlogServices.getBlogBySlugFromDb(req.params.slug);
  // Increment views when blog is accessed
  await BlogServices.incrementBlogViews(result._id.toString());
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

const likeBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.toggleBlogLike(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog liked successfully",
    data: { likes: result?.likes || 0 },
  });
});

const getRelatedBlogs = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const result = await BlogServices.getRelatedBlogsFromDb(req.params.id, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Related blogs fetched successfully",
    data: result,
  });
});

const getPopularBlogs = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await BlogServices.getPopularBlogsFromDb(limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Popular blogs fetched successfully",
    data: result,
  });
});

const getRecentBlogs = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await BlogServices.getRecentBlogsFromDb(limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recent blogs fetched successfully",
    data: result,
  });
});

export const blogController = {
  // Admin controllers
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
  getBlogStats,
  
  // Public controllers
  getPublishedBlogs,
  getPublishedBlog,
  getBlogBySlug,
  likeBlog,
  getRelatedBlogs,
  getPopularBlogs,
  getRecentBlogs,
};
