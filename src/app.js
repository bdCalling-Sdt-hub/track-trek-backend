const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./app/middleware/globalErrorHandler");
const NotFoundHandler = require("./error/NotFoundHandler");
const cookieParser = require("cookie-parser");
const path = require("path");
const corsOptions = require("./helper/corsOptions");
const routes = require("./app/routes");
const webhookRoutes = require("./app/module/payment/webhook.routes");

const stripe = require("stripe")(config.stripe.secret_key);
const endPointSecret = config.stripe.end_point_secret;


const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors(corsOptions));

app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }), // Use raw body middleware
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
      console.log("Webhook verified:", event);
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook Error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// app.use("/stripe/webhook", webhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/", routes);

app.get("/.well-known/assetlinks.json", (req, res) => {
  const filePath = path.join(__dirname, "/.well-known/assetlinks.json");
  res.sendFile(filePath);
});

app.get("/", (req, res) => res.json("Welcome to My Tracks"));

app.use(globalErrorHandler);
app.use(NotFoundHandler.handle);

module.exports = app;
