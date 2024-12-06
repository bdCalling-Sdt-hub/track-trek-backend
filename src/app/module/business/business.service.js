const { default: status } = require("http-status");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const Event = require("../event/event.model");
const postNotification = require("../../../util/postNotification");
const Track = require("../track/track.model");
const dateTimeValidator = require("../../../util/dateTimeValidator");
const { isValidDate } = require("../../../util/isValidDate");
const { logger } = require("../../../shared/logger");
const { ENUM_EVENT_STATUS } = require("../../../util/enum");
const QueryBuilder = require("../../../builder/queryBuilder");
const Booking = require("../booking/booking.model");
const { default: mongoose } = require("mongoose");

const createEvent = async (req) => {
  const { user, body, files } = req;
  const data = JSON.parse(body.data);
  const { userId } = user;
  const { startDate, startTime, endDate, endTime } = data;

  validateFields(files, ["event_image"]);
  validateFields(data, [
    "eventName",
    "address",
    "longitude",
    "latitude",
    "description",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "moreInfo",
    "maxPeople",
  ]);

  dateTimeValidator(startDate, startTime);
  dateTimeValidator(endDate, endTime);

  const newStartDateTime = new Date(`${startDate} ${startTime}`);
  const newEndDateTime = new Date(`${endDate} ${endTime}`);

  isValidDate([newStartDateTime, newEndDateTime]);

  const eventData = {
    host: userId,
    eventName: data.eventName,
    event_image: files.event_image.map((img) => img.path),
    address: data.address,
    location: {
      coordinates: [Number(data.longitude), Number(data.latitude)],
    },
    description: data.description,
    startDate,
    startTime,
    endDate,
    endTime,
    startDateTime: newStartDateTime,
    endDateTime: newEndDateTime,
    moreInfo: data.moreInfo,
    maxPeople: data.maxPeople,
  };

  const event = await Event.create(eventData);

  postNotification("New Event", "You have created a new event", userId);

  return event;
};

const joinEvent = async (user, payload) => {
  const { userId } = user;
  const { eventId, numOfPeople } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  validateFields(payload, ["eventId", "price", "numOfPeople"]);

  const event = await Event.findOne({ _id: eventId });
  if (!event) throw new ApiError(status.NOT_FOUND, "Event not found");
  if (event.status !== ENUM_EVENT_STATUS.OPEN)
    throw new ApiError(
      status.BAD_REQUEST,
      `Event is no longer open (status: ${event.status}).`
    );

  const totalPeople = event.currentPeople + numOfPeople;
  if (totalPeople > event.maxPeople)
    throw new ApiError(
      status.BAD_REQUEST,
      `${
        event.maxPeople - event.currentPeople
      } seats available. Please reduce the number of people.`
    );

  const bookingData = {
    user: userId,
    host: event.host,
    event: eventId,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    price: payload.price,
    numOfPeople,
    moreInfo: payload.moreInfo || null,
  };

  try {
    const booking = await Booking.create([bookingData], { session });

    await Event.updateOne(
      { _id: eventId },
      {
        $inc: { currentPeople: numOfPeople },
        $push: { bookings: booking[0]._id },
      }
    ).session(session);

    if (totalPeople === event.maxPeople)
      await Event.updateOne(
        { _id: eventId },
        { status: ENUM_EVENT_STATUS.FULL }
      ).session(session);

    await session.commitTransaction();

    return booking[0];
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(status.BAD_REQUEST, error.message);
  } finally {
    session.endSession();
  }
};

const createTrack = async (req) => {
  const { user, data, files } = req;
  const { userId } = user;

  validateFields(files, "track_image");
  validateFields(data, [
    "host",
    "trackName",
    "category",
    "address",
    "location",
    "description",
  ]);

  const trackData = {
    host: userId,
    trackName: data.trackName,
    category: data.category,
    track_image: files.track_image.map((img) => img.path),
    address: data.address,
    location: {
      coordinates: [Number(data.longitude), Number(data.latitude)],
    },
    description: data.description,
  };

  const track = await Track.create(trackData);

  postNotification("New Track", "You have created a new track", userId);

  return track;
};

const updateTrack = async (user, payload) => {
  const { userId } = user;

  validateFields(data, ["trackDays", "totalSlots"]);

  const test = { trackDays: data.trackDays, totalSlots: data.totalSlots };
};

const getMyBusiness = async (user, query) => {
  const eventQuery = new QueryBuilder(
    Event.find({ host: user.userId }).lean(),
    query
  )
    .search(["eventName", "address", "description"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [events, meta] = await Promise.all([
    eventQuery.modelQuery,
    eventQuery.countTotal(),
  ]);

  if (!events.length) throw new ApiError(status.NOT_FOUND, "Events not found");

  return {
    meta,
    events,
  };
};

const getAllBusiness = async (query) => {
  const eventQuery = new QueryBuilder(Event.find({}).lean(), query)
    .search(["eventName", "address", "description"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [events, meta] = await Promise.all([
    eventQuery.modelQuery,
    eventQuery.countTotal(),
  ]);

  if (!events.length)
    throw new ApiError(status.NOT_FOUND, "Destinations not found");

  return {
    meta,
    events,
  };
};

const deleteBusiness = async (query) => {
  const { eventId } = query;

  if (eventId) return await Event.deleteOne({ _id: eventId });
  else throw new ApiError(status.BAD_REQUEST, "Missing id");
};

const updateEventStatus = async () => {
  try {
    const now = new Date();

    const [started, ended] = await Promise.all([
      Event.updateMany(
        {
          startDateTime: { $lte: now },
          status: { $in: [ENUM_EVENT_STATUS.OPEN, ENUM_EVENT_STATUS.FULL] },
        },
        {
          status: ENUM_EVENT_STATUS.STARTED,
        }
      ),
      Event.updateMany(
        {
          endDateTime: { $lte: now },
          status: ENUM_EVENT_STATUS.STARTED,
        },
        {
          status: ENUM_EVENT_STATUS.ENDED,
        }
      ),
    ]);

    if (started.modifiedCount > 0)
      logger.info(`Updated ${started.modifiedCount} events status to started`);

    if (ended.modifiedCount > 0)
      logger.info(`Updated ${ended.modifiedCount} events status to ended`);
  } catch (error) {
    logger.error(`Error updating event status`);
  }
};

// update event status (e.g. started ended) every hour
setInterval(() => updateEventStatus(), 60 * 60 * 1000);

const BusinessService = {
  createEvent,
  joinEvent,
  createTrack,
  getMyBusiness,
  getAllBusiness,
  deleteBusiness,
};

module.exports = { BusinessService };
