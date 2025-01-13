const { BusinessService } = require("./business.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchAsync");

const linkPage = catchAsync(async (req, res) => {
  res.render("link.ejs");
});

const createEvent = catchAsync(async (req, res) => {
  const result = await BusinessService.createEvent(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event created",
    data: result,
  });
});

const joinEvent = catchAsync(async (req, res) => {
  const result = await BusinessService.joinEvent(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event joined",
    data: result,
  });
});

const createTrack = catchAsync(async (req, res) => {
  const result = await BusinessService.createTrack(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Track created",
    data: result,
  });
});

const updateTrack = catchAsync(async (req, res) => {
  const result = await BusinessService.updateTrack(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Track updated",
    data: result,
  });
});

const createSlot = catchAsync(async (req, res) => {
  const result = await BusinessService.createSlot(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Track updated",
    data: result,
  });
});

const deleteSlot = catchAsync(async (req, res) => {
  const result = await BusinessService.deleteSlot(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Track Slot deleted",
    data: result,
  });
});

const searchForSlots = catchAsync(async (req, res) => {
  const result = await BusinessService.searchForSlots(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Slots retrieved",
    data: result,
  });
});

const bookASlot = catchAsync(async (req, res) => {
  const result = await BusinessService.bookASlot(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Slot booked",
    data: result,
  });
});

const getSingleBusiness = catchAsync(async (req, res) => {
  const result = await BusinessService.getSingleBusiness(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business retrieved",
    data: result,
  });
});

const getMyBusiness = catchAsync(async (req, res) => {
  const result = await BusinessService.getMyBusiness(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business retrieved",
    data: result,
  });
});

const getAllBusiness = catchAsync(async (req, res) => {
  const result = await BusinessService.getAllBusiness(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business retrieved",
    data: result,
  });
});

const deleteBusiness = catchAsync(async (req, res) => {
  const result = await BusinessService.deleteBusiness(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business deleted",
    data: result,
  });
});

const getBookings = catchAsync(async (req, res) => {
  const result = await BusinessService.getBookings(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved",
    data: result,
  });
});

const viewAllParticipants = catchAsync(async (req, res) => {
  const result = await BusinessService.viewAllParticipants(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Participants retrieved",
    data: result,
  });
});

const activeDeactivateTrack = catchAsync(async (req, res) => {
  const result = await BusinessService.activeDeactivateTrack(
    req.user,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Track updated",
    data: result,
  });
});

const rentersOnDate = catchAsync(async (req, res) => {
  const result = await BusinessService.rentersOnDate(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: req.query.history ? "History retrieved" : "Renters retrieved",
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req, res) => {
  const result = await BusinessService.getAllNotifications(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved",
    data: result,
  });
});

const BusinessController = {
  linkPage,
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
  getBookings,
  viewAllParticipants,
  activeDeactivateTrack,
  rentersOnDate,
  getAllNotifications,
};

module.exports = { BusinessController };
