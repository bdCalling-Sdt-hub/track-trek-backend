const { default: status } = require("http-status");
const { ENUM_CURRENCY } = require("./enum");
const ApiError = require("../error/ApiError");

const currencyValidator = (currency) => {
  const supportedCurrencies = new Set(Object.keys(ENUM_CURRENCY));
  const formattedCurrency = currency.trim().toUpperCase();

  if (supportedCurrencies.has(formattedCurrency)) {
    return ENUM_CURRENCY[formattedCurrency];
  }

  throw new ApiError(status.BAD_REQUEST, "Invalid currency");
};

module.exports = currencyValidator;
