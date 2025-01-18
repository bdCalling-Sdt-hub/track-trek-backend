const express = require("express");
const auth = require("../../middleware/auth");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const { PaymentController } = require("./payment.controller");
const { uploadFile } = require("../../middleware/fileUploader");

const router = express.Router();

router
  .get("/success", PaymentController.successPage)
  .get("/cancel", PaymentController.cancelPage)
  .get("/reauth", PaymentController.reauthPage)
  .get("/return", PaymentController.returnPage)
  .post("/onboarding", auth(ENUM_USER_ROLE.HOST), PaymentController.onboarding)
  .post(
    "/checkout",
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST),
    PaymentController.createCheckout
  )
  .post(
    "/checkout-promotion",
    auth(ENUM_USER_ROLE.HOST),
    uploadFile(),
    PaymentController.createCheckoutForPromotion
  )
  //   .get(
  //     "/get-all-payment",
  //     auth(ENUM_USER_ROLE.ADMIN),
  //     PaymentController.getAllPayment
  //   )
  //   .post(
  //     "/checkout",
  //     auth(ENUM_USER_ROLE.USER),
  //     PaymentController.createCheckout
  //   )
  .get(
    "/get-all-payout-info",
    auth(ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.ADMIN),
    PaymentController.getAllPayoutInfo
  )
  .get(
    "/get-single-payout-info",
    auth(ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.ADMIN),
    PaymentController.getSinglePayoutInfo
  )
  .get(
    "/get-bank-details",
    auth(ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.ADMIN),
    PaymentController.getBankAccountDetails
  );

module.exports = router;
