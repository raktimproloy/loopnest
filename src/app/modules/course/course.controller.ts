import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { CourseServices } from "./course.service";
import httpStatus from "http-status";
import config from "../../config";

const createCourse = catchAsync(async (req, res) => {
  const file = (req as any).file as any;
  let payload = req.body as any;
  
  // Debug logging
  console.log('[COURSE CONTROLLER] Raw payload upcomingCourse:', payload.upcomingCourse, 'type:', typeof payload.upcomingCourse);
  
  // Final safety check for upcomingCourse
  if (payload.upcomingCourse !== undefined && payload.upcomingCourse !== null) {
    if (typeof payload.upcomingCourse === 'string') {
      const value = payload.upcomingCourse.toLowerCase().trim();
      if (value === 'true') {
        payload.upcomingCourse = 1;
      } else if (value === 'false' || value === '' || value === 'null' || value === 'undefined') {
        payload.upcomingCourse = 0;
      } else {
        const num = Number(payload.upcomingCourse);
        payload.upcomingCourse = isNaN(num) ? 0 : num;
      }
    } else if (typeof payload.upcomingCourse === 'boolean') {
      payload.upcomingCourse = payload.upcomingCourse ? 1 : 0;
    }
  } else {
    payload.upcomingCourse = 0;
  }

  // Ensure all numeric fields have default values
  payload.enrolledStudents = payload.enrolledStudents ?? 0;
  payload.moduleCount = payload.moduleCount ?? 0;
  payload.projectCount = payload.projectCount ?? 0;
  payload.assignmentCount = payload.assignmentCount ?? 0;
  payload.price = payload.price ?? 0;
  payload.originalPrice = payload.originalPrice ?? 0;
  
  console.log('[COURSE CONTROLLER] Processed payload upcomingCourse:', payload.upcomingCourse, 'type:', typeof payload.upcomingCourse);
  
  if (file) {
    const baseUrl = (config.base_url || '').replace(/\/$/, '');
    payload = { ...payload, imageUrl: `${baseUrl}/public/uploads/course/${file.filename}` };
  }
  
  const result = await CourseServices.createCourse(payload);
  
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
  const file = (req as any).file as any;
  let payload = req.body as any;
  if (file) {
    const baseUrl = (config.base_url || '').replace(/\/$/, '');
    payload = { ...payload, imageUrl: `${baseUrl}/public/uploads/course/${file.filename}` };
  }
  const result = await CourseServices.updateCourse(req.params.id, payload);
  
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
