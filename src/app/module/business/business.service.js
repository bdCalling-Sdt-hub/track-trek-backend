const { default: status } = require("http-status");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const Event = require("../event/event.model");
const postNotification = require("../../../util/postNotification");
const Track = require("../track/track.model");
const dateTimeValidator = require("../../../util/dateTimeValidator");
const { isValidDate } = require("../../../util/isValidDate");
const { logger } = require("../../../shared/logger");
const catchAsync = require("../../../shared/catchAsync");
const { ENUM_EVENT_STATUS } = require("../../../util/enum");

const createEvent = async (req) => {
  const { user, body, files } = req;
  const data = JSON.parse(body.data);
  const { userId } = user;
  const { date, startTime, endTime } = data;

  validateFields(files, ["event_image"]);
  validateFields(data, [
    "eventName",
    "address",
    "longitude",
    "latitude",
    "description",
    "date",
    "startTime",
    "endTime",
    "moreInfo",
    "maxPeople",
  ]);

  dateTimeValidator(date, startTime);
  dateTimeValidator(null, endTime);

  const newStartDateTime = new Date(`${date} ${startTime}`);
  const newEndDateTime = new Date(`${date} ${endTime}`);

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
    date,
    startTime,
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
  const { userId } = user;
  validateFields("", []);
};

const getAllBusiness = async (user, query) => {
  const { userId } = user;
  validateFields("", []);
};

const deleteBusiness = async (user, query) => {
  const { userId } = user;
  validateFields("", []);
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

setInterval(() => updateEventStatus(), 3000);

const BusinessService = {
  createEvent,
  createTrack,
  getMyBusiness,
  getAllBusiness,
  deleteBusiness,
};

module.exports = { BusinessService };
