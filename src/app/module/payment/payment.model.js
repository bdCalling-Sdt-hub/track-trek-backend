const { Schema, model } = require("mongoose");
const { ENUM_CURRENCY } = require("../../../util/enum");
const ObjectId = Schema.Types.ObjectId;

const paymentSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    host: {
      type: ObjectId,
      ref: "User",
    },
    event: {
      type: ObjectId,
      ref: "Event",
    },
    eventSlot: {
      type: ObjectId,
      ref: "EventSlot",
    },
    track: {
      type: ObjectId,
      ref: "Track",
    },
    trackSlot: {
      type: ObjectId,
      ref: "TrackSlot",
    },
    bookingId: {
      type: ObjectId,
      ref: "Booking",
    },
    businessType: {
      type: String,
      enum: ["track", "event"],
      required: true,
    },
    isPromotion: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: [ENUM_CURRENCY.GBP, ENUM_CURRENCY.AUD],
      required: true,
    },
    checkout_session_id: {
      type: String,
      unique: true,
      required: true,
    },
    payment_intent_id: {
      type: String,
    },
    status: {
      type: String,
      enum: ["unpaid", "succeeded", "refunded", "transferred"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

const Payment = model("Payment", paymentSchema);
module.exports = Payment;
