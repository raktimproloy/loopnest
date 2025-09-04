/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { TErrorSource } from '../Interface/error.interface';
import config from '../config';
import AppError from '../errors/AppError';
import handleValidationError from '../errors/HandleValidationError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDublicateError';
import handleZodError from '../errors/zodError';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong';

  let errorSources: TErrorSource = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // Handle MongoDB duplicate key error (E11000)
  if (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000)) {
    const simplifiedErrors = handleDuplicateError(error);
    statusCode = simplifiedErrors?.statusCode;
    message = simplifiedErrors?.message;
    errorSources = simplifiedErrors?.errorSources;
  } else if (error instanceof ZodError) {
    const simplifiedErrors = handleZodError(error);
    statusCode = simplifiedErrors?.statusCode;
    message = simplifiedErrors?.message;
    errorSources = simplifiedErrors?.errorSources;
  } else if (error?.name === 'ValidationError') {
    const simplifiedErrors = handleValidationError(error);
    statusCode = simplifiedErrors?.statusCode;
    message = simplifiedErrors?.message;
    errorSources = simplifiedErrors?.errorSources;
  } else if (error.name === 'CastError') {
    const simplifiedErrors = handleCastError(error);
    statusCode = simplifiedErrors?.statusCode;
    message = simplifiedErrors?.message;
    errorSources = simplifiedErrors?.errorSources;
  } else if (error.name === 'MongoServerError') {
    // Handle other MongoDB server errors
    message = 'Database error occurred';
    errorSources = [{ path: 'database', message: 'A database error occurred' }];
  } else if (error instanceof AppError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorSources = [{ path: '', message: error?.message }];
  } else if (error instanceof Error) {
    message = error?.message;
    errorSources = [{ path: '', message: error?.message }];
  } else {
    // Handle any other type of error
    message = error?.message || 'An unexpected error occurred';
    errorSources = [{ path: '', message: message }];
  }

  // Send error response without logging to console
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    ...(config.node_env === 'development' && { stack: error?.stack }),
  });
};

export default globalErrorHandler;
