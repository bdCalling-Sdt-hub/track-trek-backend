const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const BookingSchema = new Schema(
  {
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
    track: {
      type: ObjectId,
      ref: "Track",
    },
    event: {
      type: ObjectId,
      ref: "Event",
    },
    slot: {
      type: ObjectId,
      ref: "Slot",
    },
    date: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

const Booking = model("Booking", BookingSchema);

module.exports = Booking;
