const ENUM_USER_ROLE = {
  USER: "USER",
  HOST: "HOST",
  ADMIN: "ADMIN",
};

const ENUM_SLOT_STATUS = {
  OPEN: "open",
  BOOKED: "booked",
};

const ENUM_EVENT_STATUS = {
  OPEN: "open",
  FULL: "full",
  STARTED: "started",
  ENDED: "ended",
};

const ENUM_TRACK_STATUS = {
  ACTIVE: "active",
  DEACTIVATED: "deactivated",
};

const ENUM_PAYMENT_STATUS = {
  SUCCEEDED: "succeeded",
  UNPAID: "unpaid",
};

const ENUM_PROMOTION_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
};

const ENUM_BUSINESS_TYPE = {
  TRACK: "track",
  EVENT: "event",
};

const ENUM_BOOKING_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
};

module.exports = {
  ENUM_USER_ROLE,
  ENUM_EVENT_STATUS,
  ENUM_TRACK_STATUS,
  ENUM_SLOT_STATUS,
  ENUM_PAYMENT_STATUS,
  ENUM_PROMOTION_STATUS,
  ENUM_BUSINESS_TYPE,
  ENUM_BOOKING_STATUS,
};
