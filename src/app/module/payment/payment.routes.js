const express = require("express");
const auth = require("../../middleware/auth");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const { PaymentController } = require("./payment.controller");
const { uploadFile } = require("../../middleware/fileUploader");

const router = express.Router();

router
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
  .get("/success", PaymentController.successPage)
  .get("/cancel", PaymentController.cancelPage);
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
//   .get(
//     "/get-payout-info",
//     auth(ENUM_USER_ROLE.HOST, ENUM_USER_ROLE.ADMIN),
//     PaymentController.getPayoutInfo
//   );

module.exports = router;
