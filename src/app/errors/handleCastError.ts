import mongoose from 'mongoose';
import {
  TErrorSource,
  TGenericErrorResponse,
} from '../Interface/error.interface';

const handleCastError = (
  error: mongoose.Error.CastError
): TGenericErrorResponse => {
  const errorSources: TErrorSource = [
    {
      path: error?.path,
      message: 'Invalid ID',
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: 'Invalid Id',
    errorSources,
  };
};

export default handleCastError;
