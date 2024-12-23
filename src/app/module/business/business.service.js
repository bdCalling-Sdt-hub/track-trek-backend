const { default: status } = require("http-status");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const Event = require("../event/event.model");
const postNotification = require("../../../util/postNotification");
const Track = require("../track/track.model");
const dateTimeValidator = require("../../../util/dateTimeValidator");
const { isValidDate } = require("../../../util/isValidDate");
const { logger } = require("../../../shared/logger");
const { ENUM_EVENT_STATUS, ENUM_SLOT_STATUS } = require("../../../util/enum");
const QueryBuilder = require("../../../builder/queryBuilder");
const Booking = require("../booking/booking.model");
const { default: mongoose } = require("mongoose");
const moment = require("moment");
const EventSlot = require("../slot/eventSlot.model");
const TrackSlot = require("../slot/trackSlot.model");

const createEvent = async (req) => {
  const { user, body, files } = req;
  const data = JSON.parse(body.data);
  const { userId } = user;
  const { startDate, startTime, endDate, endTime } = data || {};

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
  ]);

  dateTimeValidator([startDate, endDate], [startTime, endTime]);

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
  };

  const event = await Event.create(eventData);

  postNotification("New Event", "You have created a new event", userId);

  return event;
};

const joinEvent = async (user, payload) => {
  const { userId } = user;
  const { eventId, slotId, data, price } = payload;
  let bookings = [];

  const session = await mongoose.startSession();

  validateFields(payload, ["eventId", "price", "data"]);

  const [event, slot] = await Promise.all([
    Event.findById(eventId).lean(),
    EventSlot.findById(slotId).lean(),
  ]);

  if (!event || !slot)
    throw new ApiError(
      status.NOT_FOUND,
      `${event ? "Slot" : "Event"} not found`
    );

  // if (event.status !== ENUM_EVENT_STATUS.OPEN)
  //   throw new ApiError(
  //     status.BAD_REQUEST,
  //     `Event is no longer open (status: ${event.status}).`
  //   );

  // check seat availability
  const totalPeople = slot.currentPeople + data.length;
  if (totalPeople > slot.maxPeople)
    throw new ApiError(
      status.BAD_REQUEST,
      `${slot.maxPeople - slot.currentPeople} seats available`
    );

  // preparing the bookings for saving
  const bookingData = data.map((obj) => {
    validateFields(obj, ["bookingFor", "moreInfo"]);

    if (!obj.moreInfo.length)
      throw new ApiError(status.BAD_REQUEST, "moreInfo can't be empty");

    return {
      user: userId,
      host: event.host,
      event: eventId,
      eventSlot: slotId,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      price: Number((price / data.length).toFixed(2)),
      numOfPeople: 1,
      bookingFor: obj.bookingFor,
      moreInfo: obj.moreInfo || null,
    };
  });

  try {
    await session.withTransaction(async () => {
      bookings = await Booking.create(bookingData, { session });
      const bookingIds = bookings.map((booking) => booking._id);

      const eventUpdateOperations = {
        $push: { bookings: { $each: bookingIds } },
      };
      const slotUpdateOperations = {
        $inc: { currentPeople: bookingData.length },
      };
      console.log(totalPeople, slot.maxPeople);

      if (totalPeople === slot.maxPeople) {
        eventUpdateOperations.$set = { status: ENUM_EVENT_STATUS.FULL };
        slotUpdateOperations.$set = { status: ENUM_SLOT_STATUS.BOOKED };
      }

      await Promise.all([
        Event.updateOne(
          {
            _id: eventId,
          },
          eventUpdateOperations
        ).session(session),
        EventSlot.updateOne(
          {
            _id: slotId,
          },
          slotUpdateOperations
        ).session(session),
      ]);
    });

    await session.commitTransaction();

    return bookings;
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(status.BAD_REQUEST, error.message);
  } finally {
    session.endSession();
  }
};

const createTrack = async (req) => {
  const { user, body: payload, files } = req;
  const { userId } = user;

  validateFields(files, ["track_image"]);
  validateFields(payload, [
    "trackName",
    "category",
    "address",
    "longitude",
    "latitude",
    "description",
  ]);

  const trackData = {
    host: userId,
    trackName: payload.trackName,
    category: payload.category,
    track_image: files.track_image.map((img) => img.path),
    address: payload.address,
    location: {
      coordinates: [Number(payload.longitude), Number(payload.latitude)],
    },
    description: payload.description,
  };

  const track = await Track.create(trackData);

  postNotification("New Track", "You have created a new track", userId);

  return track;
};

const updateTrack = async (user, payload) => {
  const { userId } = user;
  const { trackId, trackDays, totalSlots, renters, slots } = payload || {};

  const data = {
    trackDays,
  };

  if (trackDays.length) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Month is 0-indexed (0 = January)

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    let count = 0;

    // Iterate over all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const daysOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

      // Check if the day of the week is in the trackDays array
      if (trackDays.includes(daysOfWeek)) count++;
    }

    data.totalTrackDayInMonth = count;

    postNotification("Track Updated", `Track ${trackId} updated`, userId);
  }

  const updatedTrack = await Track.updateOne({ _id: trackId }, data).lean();

  return updatedTrack;
};

const createSlot = async (user, payload) => {
  const { userId } = user;
  const { trackId, eventId, day, startTime, endTime } = payload || {};
  let slot;

  if (!trackId && !eventId)
    throw new ApiError(
      status.BAD_REQUEST,
      "trackId or eventId is required to create slot1"
    );

  if (trackId) {
    validateFields(payload, [
      "trackId",
      "day",
      "slotNo",
      "startTime",
      "endTime",
      "price",
      "maxPeople",
      "description",
    ]);

    dateTimeValidator([], [startTime, endTime]);

    const slotData = {
      host: userId,
      track: trackId,
      day,
      slotNo: payload.slotNo,
      startTime,
      endTime,
      price: payload.price,
      maxPeople: payload.maxPeople,
      description: payload.description,
    };

    slot = await TrackSlot.create(slotData);

    Promise.all([
      Track.updateOne({ _id: trackId }, { $push: { slots: slot._id } }),
    ]);

    postNotification(
      "Slot Created",
      `New slot added to track: ${trackId}`,
      userId
    );
  }

  if (eventId) {
    validateFields(payload, [
      "eventId",
      "slotNo",
      "maxPeople",
      "price",
      "description",
    ]);

    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(status.NOT_FOUND, "Event not found");

    const slotData = {
      host: userId,
      event: eventId,
      slotNo: payload.slotNo,
      maxPeople: payload.maxPeople,
      price: payload.price,
      description: payload.description,
    };

    slot = await EventSlot.create(slotData);

    Promise.all([
      Event.updateOne({ _id: eventId }, { $push: { slots: slot._id } }),
    ]);

    postNotification(
      "Slot Created",
      `New slot added to event: ${eventId}`,
      userId
    );
  }

  return slot;
};

const deleteSlot = async (user, payload) => {
  validateFields(payload, ["slotId"]);

  const { slotId } = payload;

  const result = await TrackSlot.deleteOne({ _id: slotId });

  if (!result.deletedCount)
    throw new ApiError(status.NOT_FOUND, "No slots found");

  postNotification(
    "Slot Deleted",
    `Slot: ${slotId} has been deleted`,
    user.userId
  );

  return result;
};

const searchForSlots = async (query) => {
  const { date, trackId } = query || {};

  validateFields(query, ["date", "trackId"]);
  dateTimeValidator([date], []);

  const dayOfWeek = moment(date).format("dddd"); // 'Monday', 'Tuesday'

  const bookedSlots = await getBookedSlotsOnDate(date, { track: trackId });
  const newData = Object.values(
    bookedSlots.reduce((acc, { trackSlot, numOfPeople }) => {
      if (!acc[trackSlot]) {
        acc[trackSlot] = { _id: trackSlot, numOfPeople: 0 };
      }
      acc[trackSlot].numOfPeople += numOfPeople;
      return acc;
    }, {})
  );

  const bookedSlotIds = bookedSlots.map((booking) => booking.trackSlot);
  const slots = await TrackSlot.find({ _id: { $in: bookedSlotIds } });
  const mappedSlotIds = new Map(slots.map((obj) => [obj._id.toString(), obj]));

  const unavailableSlotIds = [];
  newData.map((obj) => {
    const match = mappedSlotIds.get(obj._id.toString());
    if (obj.numOfPeople >= match.maxPeople) {
      unavailableSlotIds.push(obj._id);
    }
  });

  const availableSlots = await TrackSlot.find({
    _id: { $nin: unavailableSlotIds },
    track: trackId,
    day: dayOfWeek,
  });

  if (!availableSlots.length)
    throw new ApiError(status.NOT_FOUND, "No slots available");

  return { count: availableSlots.length, availableSlots };
};

const bookASlot = async (user, payload) => {
  const { userId } = user;
  const { slotId, numOfPeople, date } = payload || {};

  validateFields(payload, ["slotId", "numOfPeople", "date"]);
  dateTimeValidator([date], []);

  const slot = await TrackSlot.findById(slotId);
  if (!slot) throw new ApiError(status.NOT_FOUND, "Slot not found");

  const bookedSlots = await getBookedSlotsOnDate(date, { trackSlot: slotId });
  const currentBookedSeats = totalCalculator(bookedSlots, "numOfPeople");
  const newBookedSeats = currentBookedSeats + numOfPeople;
  const totalSeats = slot.maxPeople;

  if (newBookedSeats > totalSeats)
    throw new ApiError(
      status.BAD_REQUEST,
      `${totalSeats - currentBookedSeats} seats available`
    );

  const bookingData = {
    user: userId,
    host: slot.host,
    track: slot.track,
    trackSlot: slot._id,
    startDateTime: new Date(`${date} ${slot.startTime}`),
    endDateTime: new Date(`${date} ${slot.endTime}`),
    price: slot.price * Number(numOfPeople),
    numOfPeople,
  };

  const booking = await Booking.create(bookingData);
  return booking;
};

const getSingleBusiness = async (query) => {
  const { trackId, eventId, participants, getSlots, slotId } = query || {};

  if (!eventId && !trackId)
    throw new ApiError(status.NOT_FOUND, "Missing eventId or trackId");

  if (eventId) {
    if (participants) {
      const event = await Event.findOne({ _id: eventId })
        .select("bookings")
        .lean();

      if (!event) throw new ApiError(status.NOT_FOUND, "Event not found");

      const bookings = await Booking.find({ _id: { $in: event.bookings } })
        .populate({
          path: "user",
          select: "-authId -createdAt -updatedAt -_id -__v",
        })
        .select("user numOfPeople moreInfo price -_id")
        .lean();

      return { count: bookings.length, bookings };
    } else {
      const [event, bookings, slots] = await Promise.all([
        Event.findOne({ _id: eventId }).populate({ path: "slots" }).lean(),
        Booking.find({ event: eventId })
          .select("eventSlot numOfPeople -_id")
          .lean(),
        EventSlot.find({ event: eventId }).lean(),
      ]);

      if (!event) throw new ApiError(status.NOT_FOUND, "Event not found");

      const bookedSeats = totalCalculator(bookings, "numOfPeople");
      const totalSeat = totalCalculator(slots, "maxPeople");

      return {
        totalSeat,
        unSold: totalSeat - bookedSeats,
        ...event,
      };
    }
  }

  if (trackId) {
    if (getSlots) {
      const track = await Track.findById(trackId)
        .populate({
          path: "slots",
          select: "-createdAt -updatedAt -__v",
        })
        .lean();

      return track;
    } else if (slotId) {
      const [trackSlot, bookings] = await Promise.all([
        TrackSlot.findById(slotId).select("maxPeople"),
        Booking.find({ trackSlot: slotId }).select("numOfPeople -_id").lean(),
      ]);

      if (!trackSlot)
        throw new ApiError(status.NOT_FOUND, "Track slot not found");

      const bookedSeats = totalCalculator(bookings, "numOfPeople");

      return {
        ...trackSlot.toObject(),
        unsold: trackSlot.maxPeople - bookedSeats,
      };
    } else {
      const track = await Track.findById(trackId).lean();

      if (!track) throw new ApiError(status.NOT_FOUND, "Track not found");

      return track;
    }
  }
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
  const {
    event,
    track,
    longitude,
    latitude,
    category,
    status: eventStatus,
  } = query || {};
  let events = [];
  let tracks = [];
  const searchFilters = {};

  if (longitude && latitude) {
    searchFilters.location = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        $maxDistance: 300000,
      },
    };
  }

  if (event) {
    if (eventStatus) searchFilters.status = eventStatus;
    events = await Event.find(searchFilters)
      .select(
        `
        -moreInfo 
        -bookings 
        -startDateTime 
        -endDateTime
        -createdAt
        -updatedAt
        -__v
        `
      )
      .lean();

    delete searchFilters["status"];
  }

  if (track) {
    if (category) searchFilters.category = category;
    tracks = await Track.find(searchFilters)
      .populate("host")
      .collation({ locale: "en", strength: 2 })
      .lean();

    delete searchFilters["category"];
  }

  return {
    tracks,
    events,
  };
};

const deleteBusiness = async (query) => {
  const { eventId } = query;

  if (eventId) return await Event.deleteOne({ _id: eventId });
  else throw new ApiError(status.BAD_REQUEST, "Missing id");
};

// common functions
const getBookedSlotsOnDate = async (date, dynamicData) => {
  const startDate = moment(date).startOf("day").toDate();
  const endDate = moment(date).endOf("day").toDate();

  return await Booking.find({
    ...dynamicData,
    startDateTime: {
      $gte: startDate,
      $lt: endDate,
    },
  });
};

const totalCalculator = (arrayOfObj, objKey) => {
  return arrayOfObj.reduce((acc, elem) => {
    return acc + elem[objKey];
  }, 0);
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
  updateTrack,
  createSlot,
  deleteSlot,
  searchForSlots,
  bookASlot,
  getSingleBusiness,
  getMyBusiness,
  getAllBusiness,
  deleteBusiness,
};

module.exports = { BusinessService };

// const uniqueSlotTotalBookings = Object.values(
//   bookings.reduce((acc, { eventSlot, numOfPeople }) => {
//     // console.log(eventSlot, numOfPeople);
//     if (!acc[eventSlot]) {
//       acc[eventSlot] = { eventSlot, numOfPeople: 0 };
//     }

//     acc[eventSlot].numOfPeople += numOfPeople;
//     return acc;
//   }, {})
// );

// console.log(uniqueSlotTotalBookings);

// const newEventSlots = [...slots];

// newEventSlots.map((slot) => {
//   uniqueSlotTotalBookings.find((uniqueSlot) => {
//     if (uniqueSlot.eventSlot.toString() === slot._id.toString()) {
//       console.log(slot);
//     }
//     // uniqueSlot.eventSlot.toString() === slot._id.toString();
//     // console.log("found");
//     // console.log(uniqueSlot.eventSlot.toString() === slot._id.toString());
//   });
//   // console.log(slot._id);
// });
