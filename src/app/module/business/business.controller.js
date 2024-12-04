const { BusinessService } = require("./business.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchAsync");

const createEvent = catchAsync(async (req, res) => {
  const result = await BusinessService.createEvent(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event created",
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

const getMyBusiness = catchAsync(async (req, res) => {
  const result = await BusinessService.getMyBusiness(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business retrieved",
    data: result,
  });
});

const getAllBusiness = catchAsync(async (req, res) => {
  const result = await BusinessService.getAllBusiness(req.query);
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

const BusinessController = {
  createEvent,
  createTrack,
  getMyBusiness,
  getAllBusiness,
  deleteBusiness,
};

module.exports = { BusinessController };
