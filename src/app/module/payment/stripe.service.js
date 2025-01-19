const { default: status } = require("http-status");
const config = require("../../../config");
const ApiError = require("../../../error/ApiError");
const { errorLogger } = require("../../../shared/logger");
const validateFields = require("../../../util/validateFields");
const {
  ENUM_BUSINESS_TYPE,
  ENUM_PAYMENT_STATUS,
  ENUM_PROMOTION_STATUS,
  ENUM_BOOKING_STATUS,
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

const createCheckoutForBooking = async (userData, payload) => {
  validateFields(payload, ["bookingId", "amount"]);

  const { userId } = userData;
  const { bookingId, amount } = payload;
  let session = {};

  // validate booking
  const booking = await Booking.findById(bookingId)
    .select("user host event eventSlot track trackSlot")
    .lean();
  if (!booking) throw new ApiError(status.NOT_FOUND, "Booking not found");

  // validate business
  const isEventBooking = Boolean(booking.event);
  const Model = isEventBooking ? Event : Track;
  const businessId = isEventBooking ? booking.event : booking.track;
  const business = await Model.findById(businessId).select("_id").lean();
  if (!business) throw new ApiError(status.NOT_FOUND, "Booking not found");

  const sessionData = {
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `http://${config.base_url}:${config.port}/payment/success`,
    cancel_url: `http://${config.base_url}:${config.port}/payment/cancel`,
    line_items: [
      {
        price_data: {
          currency: "gbp",
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
    session = await stripe.checkout.sessions.create(sessionData);
  } catch (error) {
    console.log(error);
    errorLogger.error(error.message);
  }

  const { id: checkout_session_id, url } = session || {};

  const paymentData = {
    bookingId: booking._id,
    ...(isEventBooking && {
      event: businessId,
      eventSlot: booking.eventSlot,
      businessType: ENUM_BUSINESS_TYPE.EVENT,
    }),
    ...(!isEventBooking && {
      track: businessId,
      trackSlot: booking.trackSlot,
      businessType: ENUM_BUSINESS_TYPE.TRACK,
    }),
    user: userId,
    host: booking.host,
    amount,
    checkout_session_id,
  };

  await Payment.create(paymentData);

  return url;
};

const createCheckoutForPromotion = async (req) => {
  const { user, body: payload, files } = req;
  const { userId } = user;
  const { trackId } = payload || {};
  let track = {};
  let session = {};

  validateFields(files, ["banner_image"]);
  validateFields(payload, ["trackId"]);

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
            name: "Promoting your track for",
          },
          unit_amount: 20 * 100,
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
    amount: 10,
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
      updatePaymentAndRelated(event.data.object);
      break;
    default:
      console.log(
        `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} Unhandled event type (${
          event.type
        })`
      );
  }
};

// ** save business payout info after successful onboarding
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

// ** utility function
const updatePaymentAndRelated = async (eventData) => {
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

  // Update booking or promotion details based on the payment type by verifying the payment data stored during the checkout session.
  if (payment.isPromotion) {
    const promotion = await Promotion.findOneAndUpdate(
      {
        checkout_session_id: id,
      },
      { status: ENUM_PROMOTION_STATUS.PAID }
    );
  } else {
    const updatedBooking = await Booking.findByIdAndUpdate(payment.bookingId, {
      status: ENUM_BOOKING_STATUS.PAID,
    });
  }
};

const StripeService = {
  onboarding,
  createCheckoutForBooking,
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
