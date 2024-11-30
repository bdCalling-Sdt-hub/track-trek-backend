const { status } = require("http-status");

const ApiError = require("../../../error/ApiError");
const Review = require("./review.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const postNotification = require("../../../util/postNotification");
const validateFields = require("../../../util/validateFields");
const { Schema } = require("mongoose");
const Track = require("../track/track.model");

const postReview = async (userData, payload) => {
  const { userId } = userData;
  const { trackId } = payload || {};
  const ReviewData = {
    user: userId,
    track: trackId,
    ...payload,
  };
  const trackObjectId = Schema.Types.ObjectId.createFromHexString(trackId);

  validateFields(payload, ["trackId", "rating", "review"]);

  const track = await Track.findById(trackId).select("user make").lean();
  if (!track) throw new ApiError(status.NOT_FOUND, "Track not found");

  const result = await Review.create(ReviewData);

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

  Promise.all([
    Car.updateOne(
      { _id: trackId },
      { rating: avgTrackRating },
      { new: true, runValidators: true }
    ),
  ]);

  postNotification(
    "New Review Alert",
    `You've received a new ${payload.rating}-star review on your ${track.make}.`,
    track.user
  );

  return result;
};

const getAllReview = async (query) => {
  const { carId, ...newQuery } = query;

  let reviewQuery;
  if (carId) {
    reviewQuery = new QueryBuilder(Review.find({ car: carId }), newQuery)
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();
  } else {
    reviewQuery = new QueryBuilder(Review.find({}), newQuery)
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();
  }

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

const ReviewService = {
  postReview,
  getAllReview,
};

module.exports = { ReviewService };
