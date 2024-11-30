const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const paymentSchema = new Schema(
  {
    track: {
      type: ObjectId,
      ref: "Track",
      required: true,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    host: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    refund_amount: {
      type: Number,
    },
    transferred_amount: {
      type: Number,
    },
    checkout_session_id: {
      type: String,
      unique: true,
      required: true,
    },
    payment_intent_id: {
      type: String,
    },
    receipt_url: {
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
