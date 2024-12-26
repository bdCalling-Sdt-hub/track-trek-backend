const { PaymentService } = require("./payment.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchAsync");
const { StripeService } = require("./stripe.service");

const getAllPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPayment(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment retrieval Successful",
    data: result,
  });
});

const createPaymentIntent = catchAsync(async (req, res) => {
  const result = await PaymentService.createPaymentIntent(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment retrieval Successful",
    data: result,
  });
});

// host only ===========================================================================
const updateHostPaymentDetails = catchAsync(async (req, res) => {
  const result = await StripeService.updateHostPaymentDetails(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message ? result.message : "Host payment details updated",
    data: result.data ? result.data : result,
  });
});

const getPayoutInfo = catchAsync(async (req, res) => {
  const result = await StripeService.getPayoutInfo(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host payout info retrieved",
    data: result,
  });
});

const transferPayment = catchAsync(async (req, res) => {
  const result = await StripeService.transferPayment(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment transfer successful",
    data: result,
  });
});

const PaymentController = {
  getAllPayment,
  updateHostPaymentDetails,
  getPayoutInfo,
  transferPayment,
};

module.exports = { PaymentController };
