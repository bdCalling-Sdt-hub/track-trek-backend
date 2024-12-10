const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const TrackSchema = new Schema(
  {
    host: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    trackName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    track_image: {
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
    trackDays: [
      {
        type: String,
      },
    ],
    totalTrackDayInMonth: {
      type: Number,
    },
    totalSlots: {
      type: Number,
    },
    renters: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    slots: [
      {
        type: ObjectId,
        ref: "Slot",
      },
    ],
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalReview: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

TrackSchema.index({ location: "2dsphere" });

const Track = model("Track", TrackSchema);

module.exports = Track;
