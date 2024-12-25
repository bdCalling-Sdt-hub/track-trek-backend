const catchAsync = require("../../../shared/catchAsync");
const sendResponse = require("../../../shared/sendResponse");
const DashboardService = require("./dashboard.service");

// destination ========================
const addCategory = catchAsync(async (req, res) => {
  const result = await DashboardService.addCategory(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category added successfully",
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const result = await DashboardService.getAllCategory(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const result = await DashboardService.deleteCategory(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

// overview ========================
const totalOverview = catchAsync(async (req, res) => {
  const result = await DashboardService.totalOverview();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Total overview retrieved successfully",
    data: result,
  });
});

const revenue = catchAsync(async (req, res) => {
  const result = await DashboardService.revenue(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Revenue retrieved successfully",
    data: result,
  });
});

const businessGrowth = catchAsync(async (req, res) => {
  const result = await DashboardService.businessGrowth(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business Growth retrieved successfully",
    data: result,
  });
});

const growth = catchAsync(async (req, res) => {
  const result = await DashboardService.growth(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Growth retrieved successfully",
    data: result,
  });
});

// booking ========================
const getBookings = catchAsync(async (req, res) => {
  const result = await DashboardService.getBookings(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Add car requests retrieved successfully",
    data: result,
  });
});

// user-host management ========================
const getAllUser = catchAsync(async (req, res) => {
  const result = await DashboardService.getAllUser(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result.result,
    meta: result.meta,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await DashboardService.getSingleUser(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Details retrieved successfully",
    data: result,
  });
});

const blockUnblockUser = catchAsync(async (req, res) => {
  const result = await DashboardService.blockUnblockUser(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blocked successfully",
    data: result,
  });
});

const DashboardController = {
  addCategory,
  getAllCategory,
  deleteCategory,
  totalOverview,
  revenue,
  businessGrowth,
  growth,
  getBookings,
  getAllUser,
  getSingleUser,
  blockUnblockUser,
};

module.exports = DashboardController;
