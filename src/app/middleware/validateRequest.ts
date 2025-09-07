import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";
import catchAsync from "../../utils/catchAsync";
import handleZodError from "../errors/zodError";

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
      // Handle Zod validation errors with detailed messages
      if (error instanceof ZodError) {
        const simplified = handleZodError(error);
        return res.status(simplified.statusCode).json({
          success: false,
          message: simplified.message,
          errorSources: simplified.errorSources,
        });
      }

      // Handle other errors via global error handler
      next(error);
    }
  });
};

export default validateRequest;
