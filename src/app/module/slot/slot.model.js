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
    },
    slotNo: {
      type: Number,
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
