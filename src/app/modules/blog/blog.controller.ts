import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { BlogServices } from "./blog.service";
import httpStatus from "http-status";

const createBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.createBlogIntoDb(req.body);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Blog created successfully",
      data: result,
    });
  }
});

const getAllBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.getAllBlogsFromDb(req.query);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blogs fetched successfully",
      data: result,
    });
  }
});

const getSingleBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.getSingleBlogFromDb(req.params.id);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blog fetched successfully",
      data: result,
    });
  }
});

const deleteBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.deleteBlogFromDb(req.params.id);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blog deleted successfully",
      data: result,
    });
  }
});

const updateBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.updateBlogIntoDb(req.params.id, req.body);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blog updated successfully",
      data: result,
    });
  }
});

export const blogController = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  deleteBlog,
  updateBlog,
};
