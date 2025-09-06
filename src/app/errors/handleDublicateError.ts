import {
  TErrorSource,
  TGenericErrorResponse,
} from '../Interface/error.interface';

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  // Prefer Mongo's structured fields if available
  const keyPattern = error?.keyPattern || {};
  const keyValue = error?.keyValue || {};
  const fieldFromKey = Object.keys(keyPattern)[0] || Object.keys(keyValue)[0];

  // Fallback: try to parse message text
  const match = error?.message?.match(/index: (\w+)_\d+ dup key: \{ .*?\}/) || error?.message?.match(/dup key: \{ (\w+):/);
  const fieldFromMessage = match && match[1];

  const fieldName = fieldFromKey || fieldFromMessage || 'field';

  let userFriendlyMessage = 'This field already exists';
  switch (fieldName) {
    case 'slug':
      userFriendlyMessage = 'A course with this slug already exists. Please choose a different slug.';
      break;
    case 'email':
      userFriendlyMessage = 'A user with this email already exists. Please use a different email.';
      break;
    case 'title':
      userFriendlyMessage = 'A course with this title already exists. Please choose a different title.';
      break;
    case 'phone':
      userFriendlyMessage = 'A user with this phone number already exists. Please use a different number.';
      break;
    default: {
      const valueShown = Object.values(keyValue)[0];
      if (valueShown) {
        userFriendlyMessage = `${fieldName} '${String(valueShown)}' already exists. Please choose a different value.`;
      }
    }
  }

  const errorSources: TErrorSource = [
    {
      path: fieldName,
      message: userFriendlyMessage,
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: userFriendlyMessage,
    errorSources,
  };
};

export default handleDuplicateError;
