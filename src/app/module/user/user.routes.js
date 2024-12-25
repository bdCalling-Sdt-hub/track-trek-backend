const express = require("express");
const auth = require("../../middleware/auth");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const { uploadFile } = require("../../middleware/fileUploader");
const { UserController } = require("./user.controller");

const router = express.Router();

router
  .get(
    "/profile",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST),
    UserController.getProfile
  )
  .patch(
    "/edit-profile",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST),
    uploadFile(),
    UserController.updateProfile
  )
  .delete(
    "/delete-account",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST),
    UserController.deleteMyAccount
  );

module.exports = router;
