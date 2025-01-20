const { status } = require("http-status");

const ApiError = require("../../../error/ApiError");
const Feedback = require("./feedback.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const postNotification = require("../../../util/postNotification");

const postFeedback = async (userData, payload) => {
  const { userId } = userData;
  const { userName, feedback } = payload;
  const feedbackData = { user: userId, ...payload };

  if (!userName || !feedback)
    throw new ApiError(status.BAD_REQUEST, "Missing userName or feedback");

  const result = await Feedback.create(feedbackData);

  postNotification("Thank You", "Thank you for your valuable feedback", userId);

  return result;
};

const getFeedback = async (query) => {
  const { id } = query;
  if (!id) throw new ApiError(status.NOT_FOUND, "Missing Id");

  const feedback = await Feedback.findById(id);
  if (!feedback) throw new ApiError(status.NOT_FOUND, "Feedback not found");

  return feedback;
};

const getMyFeedback = async (userData) => {
  const { userId } = userData;

  const feedback = await Feedback.find({ user: userId });
  if (!feedback.length)
    throw new ApiError(status.NOT_FOUND, "Feedback not found");

  return {
    count: feedback.length,
    feedback,
  };
};

const getAllFeedback = async (query) => {
  const feedbackQuery = new QueryBuilder(Feedback.find({}), query)
    .search(["userName", "feedback"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    feedbackQuery.modelQuery,
    feedbackQuery.countTotal(),
  ]);

  if (!result.length)
    throw new ApiError(status.NOT_FOUND, "Feedback not found");

  return {
    meta,
    result,
  };
};

const replyFeedback = async (payload) => {
  const { id, reply, ...others } = payload;

  if (!id || !reply)
    throw new ApiError(status.NOT_FOUND, "Missing Id or reply");

  const feedback = await Feedback.findByIdAndUpdate(
    id,
    { reply, ...others },
    { new: true, runValidators: true }
  );

  if (!feedback) throw new ApiError(status.NOT_FOUND, "Feedback not found");

  postNotification(
    "Feedback Reply",
    "Admin has replied to your feedback",
    feedback.user
  );

  return feedback;
};

const deleteFeedback = async (query) => {
  const { id } = query;

  if (!id) throw new ApiError(status.NOT_FOUND, "Missing Id");

  const result = await Feedback.deleteOne({ _id: id });

  if (!result.deletedCount)
    throw new ApiError(status.NOT_FOUND, "Feedback not found");

  return result;
};

const FeedbackService = {
  postFeedback,
  getFeedback,
  getMyFeedback,
  getAllFeedback,
  replyFeedback,
  deleteFeedback,
};

module.exports = { FeedbackService };
