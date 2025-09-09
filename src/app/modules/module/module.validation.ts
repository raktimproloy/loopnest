import z from "zod";

const createModuleValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    courseId: z.string().min(1, "Course Id is required"),
    lessons: z.array(z.string().min(1, "Lesson cannot be empty")).min(1, "At least one lesson is required"),
    duration: z.string().min(1, "Duration is required"),
    resourceLink: z.string().optional(),
    assignments: z.array(z.string().min(1, "Assignment cannot be empty")).optional(),
    videoLink: z.string().optional(),
  }),
  cookies: z.object({}).optional(),
});

const updateModuleValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    courseId: z.string().optional(),
    lessons: z.array(z.string().min(1)).optional(),
    duration: z.string().optional(),
    resourceLink: z.string().optional(),
    assignments: z.array(z.string().min(1)).optional(),
    videoLink: z.string().optional(),
  }),
  cookies: z.object({}).optional(),
});

export const ModuleValidation = {
  createModuleValidationSchema,
  updateModuleValidationSchema,
};
