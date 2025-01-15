const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchAsync");
const StripeService = require("./stripe.service");

const successPage = catchAsync(async (req, res) => {
  res.render("success.ejs");
});

const cancelPage = catchAsync(async (req, res) => {
  res.render("cancel.ejs");
});

const createCheckout = catchAsync(async (req, res) => {
  const result = await StripeService.createCheckout(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment initialized",
    data: result,
  });
});

const createCheckoutForPromotion = catchAsync(async (req, res) => {
  const result = await StripeService.createCheckoutForPromotion(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment initialized",
    data: result,
  });
});

const webhookManager = catchAsync(async (req, res) => {
  await StripeService.webhookManager(req);
  res.send();
});

const getAllPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPayment(req.query);
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

const PaymentController = {
  successPage,
  cancelPage,
  createCheckout,
  createCheckoutForPromotion,
  webhookManager,
  getAllPayment,
  updateHostPaymentDetails,
  getPayoutInfo,
};

module.exports = { PaymentController };
