const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const EventSchema = new Schema(
  {
    host: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    eventName: {
      type: String,
      required: true,
    },
    event_image: {
      type: Array,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
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
    moreInfo: [
      // array of dynamic form fields
      {
        label: {
          type: String,
          required: true,
        },
        fieldType: {
          type: String,
          default: "text",
        },
      },
    ],
    attendees: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
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

EventSchema.index({ location: "2dsphere" });

const Event = model("Event", EventSchema);

module.exports = Event;
