const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const PromotionSchema = new Schema(
  {
    host: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    track: {
      type: ObjectId,
      ref: "Track",
      required: true,
    },
    checkout_session_id: {
      type: String,
      required: true,
    },
    banner_image: {
      type: String,
      required: true,
    },
    expiredAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

const Promotion = model("Promotion", PromotionSchema);

module.exports = Promotion;
