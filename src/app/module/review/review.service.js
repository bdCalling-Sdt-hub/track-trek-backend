const { status } = require("http-status");

const ApiError = require("../../../error/ApiError");
const Review = require("./review.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const postNotification = require("../../../util/postNotification");
const validateFields = require("../../../util/validateFields");
const { default: mongoose } = require("mongoose");
const Track = require("../track/track.model");
const { logger } = require("../../../shared/logger");
const Like = require("../like/like.model");

const postReview = async (userData, payload) => {
  const { userId } = userData;
  const { trackId } = payload || {};

  validateFields(payload, ["trackId", "rating", "review"]);

  const track = await Track.findById(trackId).select("").lean();
  if (!track) throw new ApiError(status.NOT_FOUND, "Track not found");

  const ReviewData = {
    user: userId,
    track: trackId,
    ...payload,
  };
  const result = await Review.create(ReviewData);

  setImmediate(() =>
    handleBackgroundTask(trackId, userId, payload.rating, track.trackName)
  );

  return result;
};

const getAllReview = async (query) => {
  const { trackId, ...newQuery } = query;

  validateFields(query, ["trackId"]);

  const reviewQuery = new QueryBuilder(
    Review.find({ track: trackId }).populate({
      path: "user",
      select: "profile_image name -_id",
    }),
    newQuery
  )
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    reviewQuery.modelQuery,
    reviewQuery.countTotal(),
  ]);

  if (!result.length) throw new ApiError(status.NOT_FOUND, "Review not found");

  return {
    meta,
    result,
  };
};

const likeDislike = async (userData, query) => {
  const { userId } = userData;
  const { trackId } = query || {};
  const likeData = { user: userId, track: trackId };

  validateFields(query, ["trackId"]);

  const [track, liked] = await Promise.all([
    Track.findById(trackId),
    Like.findOne({ user: userId, track: trackId }),
  ]);

  if (!track) throw new ApiError(status.NOT_FOUND, "Track not found");

  if (liked) {
    Promise.all([
      Like.deleteOne({
        user: userId,
        track: trackId,
      }),
      Track.updateOne(
        {
          _id: trackId,
          totalLikes: { $gt: 0 },
        },
        { $inc: { totalLikes: -1 } },
        { runValidators: true }
      ),
    ]);

    return {
      message: "Disliked",
    };
  }

  Promise.all([
    Like.create(likeData),
    Track.updateOne(
      { _id: trackId },
      { $inc: { totalLikes: 1 } },
      { runValidators: true }
    ),
  ]);

  return {
    message: "Liked",
  };
};

const handleBackgroundTask = async (trackId, userId, rating, trackName) => {
  try {
    const trackObjectId = mongoose.Types.ObjectId.createFromHexString(trackId);

    const [avgTrackRatingAgg] = await Promise.all([
      Review.aggregate([
        {
          $match: { track: trackObjectId },
        },
        {
          $group: {
            _id: "$track",
            avgRating: {
              $avg: "$rating",
            },
          },
        },
      ]),
    ]);

    const avgTrackRating = avgTrackRatingAgg[0].avgRating.toFixed(2) ?? 0;

    await Promise.all([
      Track.updateOne(
        { _id: trackId },
        { rating: avgTrackRating, $inc: { totalReview: 1 } }
      ),
      postNotification(
        "New Review",
        `You've received a new ${rating}-star review on your ${trackName}.`,
        userId
      ),
    ]);
  } catch (error) {
    logger.error(error.message);
  }
};

const ReviewService = {
  postReview,
  getAllReview,
  likeDislike,
};

module.exports = { ReviewService };
