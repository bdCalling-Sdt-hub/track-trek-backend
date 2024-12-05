const { default: status } = require("http-status");
const ApiError = require("../error/ApiError");

const dateTimeValidator = (inputDate = null, inputTime = null) => {
  const date_regex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/; // YYYY-MM-DD
  const time_regex = /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/; // HH:MM AM/PM

  if (inputDate && !date_regex.test(inputDate))
    throw new ApiError(
      status.BAD_REQUEST,
      "Invalid date format. Use MM/DD/YYYY."
    );

  if (inputTime && !time_regex.test(inputTime))
    throw new ApiError(
      status.BAD_REQUEST,
      "Invalid time format. Use HH:MM AM/PM."
    );

  return true;
};

module.exports = dateTimeValidator;
