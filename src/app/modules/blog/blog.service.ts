import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { BlogSearchableFields } from "./blog.constant";
import { TBlog } from "./blog.interface";
import { Blog } from "./blog.model";
import httpStatus from "http-status";

export const createBlogIntoDb = async (payload: TBlog) => {
  // Check if same blog already has a blog with this title
  const isExistBlog = await Blog.findOne({
    title: payload.title,
    isDeleted: false,
  });

  if (isExistBlog) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Coupon with this code already exists"
    );
  }

  // Create new blog
  const newBlog = await Blog.create(payload);
  return newBlog;
};

export const getAllBlogsFromDb = async (query: Record<string, unknown>) => {
  const blogQuery = new QueryBuilder(Blog.find().populate("userId"), query)
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

const getSingleBlogFromDb = async (id: string) => {
  const result = await Blog.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "No blog found");
  }
  return result;
};

const deleteBlogFromDb = async (id: string) => {
  const result = await Blog.findByIdAndUpdate({ _id: id }, { isDeleted: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "No blog found");
  }
  return result;
};

const updateBlogIntoDb = async (id: string, payload: TBlog) => {
  const result = await Blog.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "No blog found");
  }
  return result;
};

export const BlogServices = {
  createBlogIntoDb,
  getAllBlogsFromDb,
  getSingleBlogFromDb,
  deleteBlogFromDb,
  updateBlogIntoDb,
};
