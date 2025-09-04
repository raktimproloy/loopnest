import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import catchAsync from "../../utils/catchAsync";

const validateRequest = (schema: ZodObject<any>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure body exists, if not set to empty object
      const body = req.body || {};
      const cookies = req.cookies || {};

      await schema.parseAsync({
        body,
        cookies,
      });

      next();
    } catch (error: any) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        const errorSources = error.issues.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errorSources,
        });
      }
      
      // Handle other errors
      next(error);
    }
  });
};

export default validateRequest;
