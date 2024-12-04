const { default: status } = require("http-status");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const Event = require("../event/event.model");
const postNotification = require("../../../util/postNotification");

const createEvent = async (req) => {
  const { user, data, files } = req;
  const { userId } = user;

  validateFields(files, "event_image");
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

  const eventData = {
    host: userId,
    eventName: data.eventName,
    event_image: files.event_image.map((img) => img.path),
    address: data.address,
    location: {
      coordinates: [Number(data.longitude), Number(data.latitude)],
    },
    description: data.description,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
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
    "trackDays",
    "totalSlots",
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
    trackDays: data.trackDays,
    totalSlots: data.totalSlots,
  };

  const track = await Event.create(trackData);

  postNotification("New Event", "You have created a new event", userId);

  return track;
};

const updateTrack = async (user, payload) => {
    
}

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

const BusinessService = {
  createEvent,
  createTrack,
  getMyBusiness,
  getAllBusiness,
  deleteBusiness,
};

module.exports = BusinessService;
