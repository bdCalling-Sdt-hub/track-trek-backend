const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

// ------track------
// host
// track
// day
// slotNo
// startTime
// endTime
// price
// description

// ------event------
// host
// event
// slotNo
// price
// description
// maxPeople
// currentPeople

const SlotSchema = new Schema(
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
    event: {
      type: ObjectId,
      ref: "Event",
      required: true,
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
      required: true,
    },
    slotNo: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxPeople: {
      type: Number,
      min: 1,
      required: true,
    },
    currentPeople: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "booked"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const Slot = model("Slot", SlotSchema);

module.exports = Slot;
