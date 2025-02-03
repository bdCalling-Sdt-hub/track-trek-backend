const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const eventSlotSchema = new Schema(
  {
    host: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: ObjectId,
      ref: "Event",
      required: true,
    },
    slotNo: {
      type: String,
      required: true,
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
      enum: ["open", "full"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const EventSlot = model("EventSlot", eventSlotSchema);

module.exports = EventSlot;
