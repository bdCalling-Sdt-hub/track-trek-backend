const { default: status } = require("http-status");
const ApiError = require("../error/ApiError");

const isValidDate = (arrOfDateTime) => {
  for (const dateTime of arrOfDateTime) {
    if (isNaN(dateTime.getTime()))
      throw new ApiError(
        status.BAD_REQUEST,
        "Invalid date. Correct format: MM/DD/YYYY, HH:MM AM/PM"
      );
  }
};

module.exports = { isValidDate };
