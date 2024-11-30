const express = require("express");
const auth = require("../../middleware/auth");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const { ReviewController } = require("./review.controller");

const router = express.Router();

router
  .post("/post-review", auth(ENUM_USER_ROLE.USER), ReviewController.postReview)
  .get("/get-all-review", ReviewController.getAllReview);

module.exports = router;
