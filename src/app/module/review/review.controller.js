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

const likeDislike = catchAsync(async (req, res) => {
  const result = await ReviewService.likeDislike(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message ? result.message : "Liked",
  });
});

const ReviewController = {
  postReview,
  getAllReview,
  likeDislike,
};

module.exports = { ReviewController };
