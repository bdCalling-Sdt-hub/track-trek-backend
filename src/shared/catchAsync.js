const catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      console.log("catchAsync----------------------------------", error.errors);
      next(error);
    }
  };
};

module.exports = catchAsync;
