const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const ReviewSchema = new Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    track: {
      type: ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = model("Review", ReviewSchema);

module.exports = Review;
