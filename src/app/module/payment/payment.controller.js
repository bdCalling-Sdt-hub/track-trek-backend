const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchAsync");
const StripeService = require("./stripe.service");
const { PaymentService } = require("./payment.service");

const successPage = catchAsync(async (req, res) => {
  res.render("success.ejs");
});

const cancelPage = catchAsync(async (req, res) => {
  res.render("cancel.ejs");
});

const reauthPage = catchAsync(async (req, res) => {
  res.render("reauth.ejs");
});

const returnPage = catchAsync(async (req, res) => {
  await StripeService.savePayoutInfo(req.query);
  res.render("return.ejs");
});

const onboarding = catchAsync(async (req, res) => {
  const result = await StripeService.onboarding(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Onboarding initialized",
    data: result,
  });
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

const getBankAccountDetails = catchAsync(async (req, res) => {
  const result = await StripeService.getBankAccountDetails(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bank account retrieved",
    data: result,
  });
});

const getAllPayoutInfo = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPayoutInfo(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host payout info retrieved",
    data: result,
  });
});

const getSinglePayoutInfo = catchAsync(async (req, res) => {
  const result = await PaymentService.getSinglePayoutInfo(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business payout info retrieved",
    data: result,
  });
});

const PaymentController = {
  successPage,
  cancelPage,
  reauthPage,
  returnPage,
  onboarding,
  createCheckout,
  createCheckoutForPromotion,
  webhookManager,
  getAllPayment,
  updateHostPaymentDetails,
  getAllPayoutInfo,
  getBankAccountDetails,
  getSinglePayoutInfo,
};

module.exports = { PaymentController };
