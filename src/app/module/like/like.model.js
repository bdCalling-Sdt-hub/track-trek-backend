const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const likeSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    track: {
      type: ObjectId,
      ref: "Track",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Like = model("Like", likeSchema);

module.exports = Like;
