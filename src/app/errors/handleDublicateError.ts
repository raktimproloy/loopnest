import {
  TErrorSource,
  TGenericErrorResponse,
} from '../Interface/error.interface';

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const match = error.message.match(/"([^"]*)"/);
  const extractedMessage = match && match[1];

  // Determine the field name from the error
  let fieldName = 'field';
  let userFriendlyMessage = 'This field already exists';
  
  if (extractedMessage) {
    if (extractedMessage.includes('slug')) {
      fieldName = 'slug';
      userFriendlyMessage = 'A course with this slug already exists. Please choose a different slug.';
    } else if (extractedMessage.includes('email')) {
      fieldName = 'email';
      userFriendlyMessage = 'A user with this email already exists. Please use a different email.';
    } else if (extractedMessage.includes('title')) {
      fieldName = 'title';
      userFriendlyMessage = 'A course with this title already exists. Please choose a different title.';
    } else {
      userFriendlyMessage = `${extractedMessage} already exists. Please choose a different value.`;
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
    message: 'Duplicate Entry Error',
    errorSources,
  };
};

export default handleDuplicateError;
