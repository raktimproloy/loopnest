import { z } from "zod";

const instructorValidationSchema = z.object({
  name: z.string().min(2, "Instructor name must be at least 2 characters"),
  role: z.string().min(2, "Instructor role must be at least 2 characters"),
  bio: z.string().min(10, "Instructor bio must be at least 10 characters"),
  imageUrl: z.string().url("Invalid instructor image URL"),
});

const courseModuleValidationSchema = z.object({
  title: z.string().min(2, "Module title must be at least 2 characters"),
  lessons: z.array(z.string().min(1, "Lesson title cannot be empty")).min(1, "At least one lesson is required"),
});

const statisticsValidationSchema = z.object({
  enrolledStudents: z.number().min(0, "Enrolled students cannot be negative"),
  moduleCount: z.number().min(0, "Module count cannot be negative"),
  projectCount: z.number().min(0, "Project count cannot be negative"),
  assignmentCount: z.number().min(0, "Assignment count cannot be negative"),
  price: z.number().min(0, "Price cannot be negative"),
  originalPrice: z.number().min(0, "Original price cannot be negative"),
});

const createCourseValidationSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Course title must be at least 5 characters"),
    batchName: z.string().min(2, "Batch name must be at least 2 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    imageUrl: z.string().url("Invalid image URL"),
    courseType: z.string().min(2, "Course type must be at least 2 characters"),
    upcomingCourse: z.number().min(0, "Upcoming course value cannot be negative"),
    statistics: statisticsValidationSchema,
    instructors: z.array(instructorValidationSchema).min(1, "At least one instructor is required"),
    courseFeatures: z.array(z.string().min(1, "Feature cannot be empty")).min(1, "At least one course feature is required"),
    courseModules: z.array(courseModuleValidationSchema).min(1, "At least one course module is required"),
    assignments: z.array(z.string().min(1, "Assignment cannot be empty")),
    projects: z.array(z.string().min(1, "Project cannot be empty")),
  }),
  cookies: z.object({}).optional(),
});

const updateCourseValidationSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Course title must be at least 5 characters").optional(),
    batchName: z.string().min(2, "Batch name must be at least 2 characters").optional(),
    description: z.string().min(20, "Description must be at least 20 characters").optional(),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens").optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    courseType: z.string().min(2, "Course type must be at least 2 characters").optional(),
    upcomingCourse: z.number().min(0, "Upcoming course value cannot be negative").optional(),
    statistics: statisticsValidationSchema.optional(),
    instructors: z.array(instructorValidationSchema).min(1, "At least one instructor is required").optional(),
    courseFeatures: z.array(z.string().min(1, "Feature cannot be empty")).min(1, "At least one course feature is required").optional(),
    courseModules: z.array(courseModuleValidationSchema).min(1, "At least one course module is required").optional(),
    assignments: z.array(z.string().min(1, "Assignment cannot be empty")).optional(),
    projects: z.array(z.string().min(1, "Project cannot be empty")).optional(),
    isPublished: z.boolean().optional(),
  }),
  cookies: z.object({}).optional(),
});

export const CourseValidation = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
};
