const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const trackSlotSchema = new Schema(
  {
    host: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    track: {
      type: ObjectId,
      ref: "Track",
    },
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    slotNo: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    maxPeople: {
      type: Number,
      min: 1,
      required: true,
    },
    // currentPeople: {
    //   type: Number,
    //   min: 0,
    //   default: 0,
    // },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TrackSlot = model("TrackSlot", trackSlotSchema);

module.exports = TrackSlot;
