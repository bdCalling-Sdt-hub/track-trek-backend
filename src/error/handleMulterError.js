const createErrorMessage = require("../util/createErrorMessage");

const handleMulterError = (err) => {
  let message;
  const { code, field, message: defaultMsg } = err;

  switch (code) {
    case "LIMIT_UNEXPECTED_FILE":
      message = `LIMIT_UNEXPECTED_FILE. Too many files for filed: ${field}`;
      break;
    case "LIMIT_FILE_SIZE":
      message = `File size too large for field: ${field}`;
      break;
    default:
      message = defaultMsg || "File upload error";
  }

  return {
    statusCode: 400,
    message,
    errorMessages: createErrorMessage(message, field),
  };
};

module.exports = handleMulterError;
