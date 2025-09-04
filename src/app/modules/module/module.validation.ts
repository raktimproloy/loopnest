import z from "zod";
import { TModule } from "./module.interface";

const createModuleValidationSchema = z.object({
  body: z.object({
    title: z.string().nonempty("Title is required"),
    course: z.string().nonempty("Course is required"),
    lessons: z.array(z.object({})),
    userId: z.string().nonempty("User Id is required"),
  }),
  cookies: z.object({}).optional(),
});

const updateModuleValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    course: z.string().optional(),
    lessons: z.array(z.object({})).optional(),
  }),
  cookies: z.object({}).optional(),
});

export const ModuleValidation = {
  createModuleValidationSchema,
  updateModuleValidationSchema,
};
