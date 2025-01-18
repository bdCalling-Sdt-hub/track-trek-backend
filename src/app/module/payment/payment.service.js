const { status } = require("http-status");

const ApiError = require("../../../error/ApiError");
const QueryBuilder = require("../../../builder/queryBuilder");
const Payment = require("./payment.model");
const PayoutInfo = require("./PayoutInfo");

const getAllPayment = async (query) => {
  const paymentQuery = new QueryBuilder(
    Payment.find({}).populate("user host car"),
    query
  )
    .search(["checkout_session_id", "payment_intent_id"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    paymentQuery.modelQuery,
    paymentQuery.countTotal(),
  ]);

  return {
    meta,
    result,
  };
};

const getAllPayoutInfo = async (query) => {
  const payoutQuery = new QueryBuilder(PayoutInfo.find({}), query)
    .search(["stripe_account_id", "bank_account_no_last4", "routing_no"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    payoutQuery.modelQuery,
    payoutQuery.countTotal(),
  ]);

  return {
    meta,
    result,
  };
};

const getSinglePayoutInfo = async (userData) => {
  const { userId } = userData;

  const existingPayoutInfo = await PayoutInfo.findOne({ host: userId });
  if (!existingPayoutInfo)
    throw new ApiError(
      status.NOT_FOUND,
      "Bank information not found. Please complete onboarding"
    );

  return existingPayoutInfo;
};

const PaymentService = {
  getAllPayment,
  getAllPayoutInfo,
  getSinglePayoutInfo,
};

module.exports = { PaymentService };
