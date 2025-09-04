import z, { ZodError } from 'zod';
import {
  TErrorSource,
  TGenericErrorResponse,
} from '../Interface/error.interface';

const handleZodError = (error: ZodError): TGenericErrorResponse => {
  const statusCode = 400;
  const errorSources: TErrorSource = error.issues.map(
    (issue: z.core.$ZodIssue) => ({
      path: issue?.path[issue?.path?.length - 1] as string | number,
      message: issue?.message,
    })
  );
  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleZodError;
