const express = require("express");
const auth = require("../../middleware/auth");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const { uploadFile } = require("../../middleware/fileUploader");
const { BusinessController } = require("./business.controller");

const router = express.Router();

router
  .get("/link", BusinessController.linkPage)
  .post(
    "/track",
    auth(ENUM_USER_ROLE.HOST),
    uploadFile(),
    BusinessController.createTrack
  )
  .patch(
    "/update-track",
    auth(ENUM_USER_ROLE.HOST),
    BusinessController.updateTrack
  )
  .post(
    "/create-slot",
    auth(ENUM_USER_ROLE.HOST),
    BusinessController.createSlot
  )
  .delete(
    "/delete-slot",
    auth(ENUM_USER_ROLE.HOST),
    BusinessController.deleteSlot
  )
  .get(
    "/search-for-slots",
    auth(ENUM_USER_ROLE.USER),
    BusinessController.searchForSlots
  )
  .post("/book-a-slot", auth(ENUM_USER_ROLE.USER), BusinessController.bookASlot)
  .post(
    "/event",
    auth(ENUM_USER_ROLE.HOST),
    uploadFile(),
    BusinessController.createEvent
  )
  .post("/join-event", auth(ENUM_USER_ROLE.USER), BusinessController.joinEvent)
  .get(
    "/get-single-business",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.ADMIN),
    BusinessController.getSingleBusiness
  )
  .get(
    "/all-business",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.ADMIN),
    BusinessController.getAllBusiness
  )
  .get(
    "/my-business",
    auth(ENUM_USER_ROLE.HOST),
    BusinessController.getMyBusiness
  )
  .delete(
    "/delete-business",
    auth(ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.ADMIN),
    BusinessController.deleteBusiness
  )
  .get(
    "/get-booking",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST),
    BusinessController.getBookings
  )
  .get(
    "/view-all-participants",
    auth(ENUM_USER_ROLE.HOST),
    BusinessController.viewAllParticipants
  )
  .patch(
    "/active-deactivate-track",
    auth(ENUM_USER_ROLE.HOST),
    BusinessController.activeDeactivateTrack
  )
  .get(
    "/renters-on-date",
    auth(ENUM_USER_ROLE.HOST),
    BusinessController.rentersOnDate
  )
  .get(
    "/get-all-notifications",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST),
    BusinessController.getAllNotifications
  );

module.exports = router;
