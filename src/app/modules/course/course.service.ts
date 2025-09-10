import AppError from '../../errors/AppError';
import { TCourse, TCourseCreateData, TCourseUpdateData } from './course.interface';
import { Course } from './course.model';
import httpStatus from 'http-status';

export const createCourse = async (payload: TCourseCreateData) => {
  try {
    // Ensure upcomingCourse is always a valid number
    let upcomingCourseValue = 0;
    
    if (payload.upcomingCourse !== undefined && payload.upcomingCourse !== null) {
      if (typeof payload.upcomingCourse === 'string') {
        const value = payload.upcomingCourse.toLowerCase().trim();
        if (value === 'true') {
          upcomingCourseValue = 1;
        } else if (value === 'false' || value === '' || value === 'null' || value === 'undefined') {
          upcomingCourseValue = 0;
        } else {
          const num = Number(payload.upcomingCourse);
          upcomingCourseValue = isNaN(num) ? 0 : num;
        }
      } else if (typeof payload.upcomingCourse === 'boolean') {
        upcomingCourseValue = payload.upcomingCourse ? 1 : 0;
      } else if (typeof payload.upcomingCourse === 'number') {
        upcomingCourseValue = payload.upcomingCourse;
      }
    }

    console.log('[COURSE SERVICE] Final upcomingCourse value:', upcomingCourseValue, 'type:', typeof upcomingCourseValue);

    // Ensure all numeric fields have default values
    const courseData = {
      ...payload,
      upcomingCourse: upcomingCourseValue,
      enrolledStudents: payload.enrolledStudents ?? 0,
      moduleCount: payload.moduleCount ?? 0,
      projectCount: payload.projectCount ?? 0,
      assignmentCount: payload.assignmentCount ?? 0,
      price: payload.price ?? 0,
      originalPrice: payload.originalPrice ?? 0,
      isPublished: true,
    };

    console.log('[COURSE SERVICE] Course data being created:', {
      title: courseData.title,
      enrolledStudents: courseData.enrolledStudents,
      moduleCount: courseData.moduleCount,
      projectCount: courseData.projectCount,
      assignmentCount: courseData.assignmentCount,
      price: courseData.price,
      originalPrice: courseData.originalPrice,
      upcomingCourse: courseData.upcomingCourse,
      instructorsCount: courseData.instructors?.length || 0,
      courseFeaturesCount: courseData.courseFeatures?.length || 0,
      courseModulesCount: courseData.courseModules?.length || 0,
      projectsCount: courseData.projects?.length || 0,
    });

    // Create new course - let MongoDB handle duplicate key constraint
    const newCourse = await Course.create(courseData);

    return newCourse;
  } catch (error: any) {
    console.log('[COURSE SERVICE] Error creating course:', error.message);
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Course with this slug already exists"
      );
    }
    // Re-throw other errors
    throw error;
  }
};

export const getAllCourses = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10, courseType, upcomingCourse, isPublished, search } = query;
  
  // Build filter object
  const filter: any = { isDeleted: false };
  
  if (courseType) {
    filter.courseType = courseType;
  }
  
  if (upcomingCourse !== undefined) {
    filter.upcomingCourse = upcomingCourse === 'true' ? { $gt: 0 } : 0;
  }
  
  if (isPublished !== undefined) {
    filter.isPublished = isPublished === 'true';
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { courseType: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Get courses
  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Get total count
  const total = await Course.countDocuments(filter);
  const totalPages = Math.ceil(total / Number(limit));

  return {
    courses,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  };
};

export const getCourseById = async (courseId: string) => {
  const course = await Course.findOne({
    _id: courseId,
    isDeleted: false,
  });
  
  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};

export const getCourseBySlug = async (slug: string) => {
  const course = await Course.findOne({
    slug,
    isDeleted: false,
  });
  
  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};

export const updateCourse = async (courseId: string, updateData: TCourseUpdateData) => {
  try {
    // Check if course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse || existingCourse.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, "Course not found");
    }

    // Update course - let MongoDB handle duplicate key constraint
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      throw new AppError(httpStatus.NOT_FOUND, "Course not found");
    }

    return updatedCourse;
  } catch (error: any) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Course with this slug already exists"
      );
    }
    // Re-throw other errors
    throw error;
  }
};

export const deleteCourse = async (courseId: string) => {
  const course = await Course.findById(courseId);
  if (!course || course.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  // Soft delete
  await Course.findByIdAndUpdate(courseId, { isDeleted: true });

  return { message: "Course deleted successfully" };
};

export const CourseServices = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
};
