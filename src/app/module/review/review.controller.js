const { ReviewService } = require("./review.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchAsync");

const postReview = catchAsync(async (req, res) => {
  const result = await ReviewService.postReview(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review posted",
    data: result,
  });
});

const getAllReview = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReview(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review retrieved",
    data: result,
  });
});

const ReviewController = {
  postReview,
  getAllReview,
};

module.exports = { ReviewController };
