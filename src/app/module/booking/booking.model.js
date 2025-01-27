const { Schema, model } = require("mongoose");
const { ENUM_CURRENCY } = require("../../../util/enum");
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
    trackSlot: {
      type: ObjectId,
      ref: "TrackSlot",
    },
    event: {
      type: ObjectId, // *********** event ***********
      ref: "Event",
    },
    eventSlot: {
      type: ObjectId,
      ref: "EventSlot",
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
    currency: {
      type: String,
      enum: [ENUM_CURRENCY .GBP, ENUM_CURRENCY.AUD],
      required: true,
    },
    numOfPeople: {
      type: Number, // *********** event ***********
    },
    bookingFor: {
      type: String, // *********** event ***********
      enum: ["self", "other"],
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
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = model("Booking", BookingSchema);

module.exports = Booking;
