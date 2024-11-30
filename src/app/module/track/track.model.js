const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const TrackSchema = new Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Track = model("Track", TrackSchema);

module.exports = Track;
