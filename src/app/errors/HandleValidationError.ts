import mongoose from 'mongoose';
import {
  TErrorSource,
  TGenericErrorResponse,
} from '../Interface/error.interface';

const handleValidationError = (
  error: mongoose.Error.ValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSource = Object.values(error.errors).map(
    (el: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: el?.path,
        message: el?.message,
      };
    }
  );

  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation Errors',
    errorSources,
  };
};

export default handleValidationError;
