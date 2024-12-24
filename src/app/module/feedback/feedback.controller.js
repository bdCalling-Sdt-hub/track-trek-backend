const { FeedbackService } = require("./feedback.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchAsync");

const postFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackService.postFeedback(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback posted",
    data: result,
  });
});

const getFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackService.getFeedback(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback retrieved",
    data: result,
  });
});

const getMyFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackService.getMyFeedback(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback retrieved",
    data: result,
  });
});

const getAllFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackService.getAllFeedback(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback retrieved",
    data: result,
  });
});

const replyFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackService.replyFeedback(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback replied",
    data: result,
  });
});

const deleteFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackService.deleteFeedback(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback deleted",
    data: result,
  });
});

const FeedbackController = {
  postFeedback,
  getFeedback,
  getMyFeedback,
  getAllFeedback,
  replyFeedback,
  deleteFeedback,
};

module.exports = { FeedbackController };
