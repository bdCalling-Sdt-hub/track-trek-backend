const express = require("express");
const auth = require("../../middleware/auth");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const { PaymentController } = require("./payment.controller");

const router = express.Router();

router.post("/create-payment-intent", PaymentController.payPage);
//   .get("/pay", PaymentController.payPage)
//   .get("/success", PaymentController.successPage)
//   .get("/cancel", PaymentController.cancelPage)
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
