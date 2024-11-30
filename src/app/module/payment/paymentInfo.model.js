const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const payoutInfoSchema = new Schema(
  {
    host: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    stripe_account_id: {
      type: String,
      required: true,
    },
    bank_account_no: {
      type: String,
      required: true,
    },
    routing_no: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PayoutInfo = model("PayoutInfo", payoutInfoSchema);
module.exports = PayoutInfo;
