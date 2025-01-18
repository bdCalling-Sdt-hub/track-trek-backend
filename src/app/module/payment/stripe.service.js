const { default: status } = require("http-status");
const config = require("../../../config");
const ApiError = require("../../../error/ApiError");
const { errorLogger } = require("../../../shared/logger");
const validateFields = require("../../../util/validateFields");
const {
  ENUM_BUSINESS_TYPE,
  ENUM_PAYMENT_STATUS,
  ENUM_PROMOTION_STATUS,
} = require("../../../util/enum");
const Event = require("../event/event.model");
const Track = require("../track/track.model");
const Booking = require("../booking/booking.model");
const Payment = require("./payment.model");
const Promotion = require("../../promotion/Promotion");
const PayoutInfo = require("./PayoutInfo");

const stripe = require("stripe")(config.stripe.secret_key);
const endPointSecret = config.stripe.end_point_secret;

const onboarding = async (userData) => {
  const accountData = {
    country: "GB",
    type: "express",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  };

  const account = await stripe.accounts.create(accountData);

  const accountLinkData = {
    account: account.id,
    refresh_url: `http://${config.base_url}:${config.port}/payment/reauth`,
    return_url: `http://${config.base_url}:${config.port}/payment/return?connectedAccountId=${account.id}&hostId=${userData.userId}`,
    type: "account_onboarding",
  };

  const accountLink = await stripe.accountLinks.create(accountLinkData);

  return {
    accountLink,
  };
};

const createCheckout = async (userData, payload) => {
  const { userId } = userData || {};
  const { businessId, bookingId, businessType, isPromotion, amount } =
    payload || {};
  let business = {};
  let booking = {};
  let session = {};
  let businessData = {};

  validateFields(payload, ["businessId", "businessType", "amount"]);

  const Model = businessType === ENUM_BUSINESS_TYPE.EVENT ? Event : Track;

  const sessionData = {
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `http://${config.base_url}:${config.port}/payment/success`,
    cancel_url: `http://${config.base_url}:${config.port}/payment/cancel`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Amount",
          },
          unit_amount: Number(amount) * 100,
        },
        quantity: 1,
      },
    ],
  };

  try {
    [business, booking, session] = await Promise.all([
      Model.findById(businessId),
      Booking.findById(bookingId),
      stripe.checkout.sessions.create(sessionData),
    ]);
  } catch (error) {
    console.log(error);
    errorLogger.error(error.message);
  }

  if (!business) throw new ApiError(status.NOT_FOUND, "Business not found");
  if (bookingId)
    if (!booking) throw new ApiError(status.NOT_FOUND, "Booking not found");

  const { id: checkout_session_id, url } = session || {};

  const paymentData = {
    ...(!isPromotion && { user: userId }),
    ...(isPromotion && { host: userId }),

    ...(businessType === ENUM_BUSINESS_TYPE.TRACK && { track: businessId }),
    ...(businessType === ENUM_BUSINESS_TYPE.EVENT && { event: businessId }),

    ...(!isPromotion && { bookingId: bookingId }),
    ...(isPromotion && { isPromotion }),

    businessType,
    amount,
    checkout_session_id,
  };

  await Payment.create(paymentData);

  return url;
};

const createCheckoutForPromotion = async (req) => {
  const { user, body: payload, files } = req;
  const { userId } = user;
  const { trackId, amount } = payload || {};
  let track = {};
  let session = {};

  validateFields(files, ["banner_image"]);
  validateFields(payload, ["trackId", "amount"]);

  const sessionData = {
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `http://${config.base_url}:${config.port}/payment/success`,
    cancel_url: `http://${config.base_url}:${config.port}/payment/cancel`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Track Promotion",
          },
          unit_amount: Number(amount) * 100,
        },
        quantity: 1,
      },
    ],
  };

  try {
    [track, session] = await Promise.all([
      Track.findById(trackId),
      stripe.checkout.sessions.create(sessionData),
    ]);
  } catch (error) {
    console.log(error);
    errorLogger.error(error.message);
  }

  if (!track) throw new ApiError(status.NOT_FOUND, "Business not found");

  const { id: checkout_session_id, url } = session || {};

  const paymentData = {
    host: userId,
    trackId,
    businessType: ENUM_BUSINESS_TYPE.TRACK,
    isPromotion: true,
    amount,
    checkout_session_id,
  };
  const promotionData = {
    host: userId,
    track: trackId,
    checkout_session_id,
    banner_image: files.banner_image[0].path,
  };

  await Promise.all([
    Payment.create(paymentData),
    Promotion.create(promotionData),
  ]);

  return url;
};

const webhookManager = async (req) => {
  const sig = req.headers["stripe-signature"];
  let event;
  const date = new Date();

  console.log("webhook hit");

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endPointSecret);
  } catch (error) {
    res.status(400).send(`Webhook error: ${error.message}`);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      updatePayment(event.data.object);
      break;
    default:
      console.log(
        `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} Unhandled event type (${
          event.type
        })`
      );
  }
};

// save business payout info after successful onboarding
const savePayoutInfo = async (query) => {
  const { connectedAccountId, hostId } = query;

  const bankAccounts = await stripe.accounts.listExternalAccounts(
    connectedAccountId,
    { object: "bank_account" }
  );

  const payoutData = {
    host: hostId,
    stripe_account_id: connectedAccountId,
    bank_account_no_last4: bankAccounts.data[0].last4,
    routing_no: bankAccounts.data[0].routing_number,
  };

  const payoutInfo = await PayoutInfo.create(payoutData);
};

const getBankAccountDetails = async (connectedAccountId) => {
  const bankAccounts = await stripe.accounts.listExternalAccounts(
    // connectedAccountId,
    "acct_1QiU2yBG91GJM2ry",
    {
      object: "bank_account",
    }
  );
  return bankAccounts;
};

// utility function
const updatePayment = async (eventData) => {
  const { id, payment_intent } = eventData;

  // const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

  const payment = await Payment.findOneAndUpdate(
    { checkout_session_id: id },
    {
      $set: {
        payment_intent_id: payment_intent,
        status: ENUM_PAYMENT_STATUS.SUCCEEDED,
      },
    },
    { new: true }
  );

  const promotion = await Promotion.findOneAndUpdate(
    {
      checkout_session_id: id,
    },
    { status: ENUM_PROMOTION_STATUS.PAID }
  );
};

const StripeService = {
  onboarding,
  createCheckout,
  createCheckoutForPromotion,
  webhookManager,
  savePayoutInfo,
  getBankAccountDetails,
};

module.exports = StripeService;

// const paymentIntent = await stripe.paymentIntents.create({
//   amount: amountInCents,
//   currency: "usd",
//   automatic_payment_methods: {
//     enabled: true,
//   },
//   application_fee_amount: amountInCents * 0.2,
//   transfer_data: {
//     destination: propertyCreator?.stripeAccountInfo?.accountId,
//   },
//   on_behalf_of: propertyCreator?.stripeAccountInfo?.accountId,
// });
