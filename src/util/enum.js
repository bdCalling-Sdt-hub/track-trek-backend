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

module.exports = {
  ENUM_USER_ROLE,
  ENUM_EVENT_STATUS,
  ENUM_TRACK_STATUS,
  ENUM_SLOT_STATUS,
};
