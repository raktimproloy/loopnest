import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { CourseServices } from "./course.service";
import httpStatus from "http-status";

const createCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.createCourse(req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req, res) => {
  const result = await CourseServices.getAllCourses(req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses fetched successfully",
    data: result,
  });
});

const getCourseById = catchAsync(async (req, res) => {
  const result = await CourseServices.getCourseById(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course fetched successfully",
    data: result,
  });
});

const getCourseBySlug = catchAsync(async (req, res) => {
  const result = await CourseServices.getCourseBySlug(req.params.slug);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course fetched successfully",
    data: result,
  });
});

const updateCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.updateCourse(req.params.id, req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course updated successfully",
    data: result,
  });
});

const deleteCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.deleteCourse(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const courseController = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
};
