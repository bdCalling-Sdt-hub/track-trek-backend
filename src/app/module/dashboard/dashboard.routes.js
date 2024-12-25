const auth = require("../../middleware/auth");
const express = require("express");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const DashboardController = require("./dashboard.controller");
const { uploadFile } = require("../../middleware/fileUploader");

const router = express.Router();

router

  // booking ===============================
  .get(
    "/get-bookings",
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.getBookings
  )

  // category ========================
  .post(
    "/add-category",
    auth(ENUM_USER_ROLE.ADMIN),
    uploadFile(),
    DashboardController.addCategory
  )
  .get(
    "/get-all-category",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.USER),
    DashboardController.getAllCategory
  )
  .delete(
    "/delete-category",
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.deleteCategory
  )

  // overview ========================
  .get(
    "/total-overview",
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.totalOverview
  )
  .get("/revenue", auth(ENUM_USER_ROLE.ADMIN), DashboardController.revenue)
  .get(
    "/business-growth",
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.businessGrowth
  )
  .get("/growth", auth(ENUM_USER_ROLE.ADMIN), DashboardController.growth)

  // user-host management ========================
  .get(
    "/get-all-user",
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.getAllUser
  )
  .get(
    "/get-user-details",
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.getSingleUser
  )
  .patch(
    "/block-unblock-user",
    auth(ENUM_USER_ROLE.ADMIN),
    DashboardController.blockUnblockUser
  );

module.exports = router;
