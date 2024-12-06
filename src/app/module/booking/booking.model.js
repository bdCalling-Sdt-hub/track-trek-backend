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
      type: ObjectId, // *********** event ***********
      ref: "Event",
    },
    slot: {
      type: ObjectId,
      ref: "Slot",
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    numOfPeople: {
      type: Number, // *********** event ***********
    },
    moreInfo: [
      // *********** event ***********
      {
        label: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Booking = model("Booking", BookingSchema);

module.exports = Booking;
