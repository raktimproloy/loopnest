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

  if (error instanceof ZodError) {
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
  } else if (error.code === 11000) {
    const simplifiedErrors = handleDuplicateError(error);
    statusCode = simplifiedErrors?.statusCode;
    message = simplifiedErrors?.message;
    errorSources = simplifiedErrors?.errorSources;
  } else if (error instanceof AppError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorSources = [{ path: '', message: error?.message }];
  } else if (error instanceof Error) {
    message = error?.message;
    errorSources = [{ path: '', message: error?.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,

    stack: config.node_env === 'development' ? error?.stack : null,
  });
};

export default globalErrorHandler;
