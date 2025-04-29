const fs = require("fs");
const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./app/middleware/globalErrorHandler");
const NotFoundHandler = require("./error/NotFoundHandler");
const cookieParser = require("cookie-parser");
const path = require("path");
const corsOptions = require("./helper/corsOptions");
const routes = require("./app/routes");
const webhookRoutes = require("./app/module/payment/webhook.routes");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors(corsOptions));
app.use("/stripe/webhook", webhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/", routes);

app.get("/.well-known/assetlinks.json", (req, res) => {
  const filePath = path.join(__dirname, "/.well-known/assetlinks.json");
  res.sendFile(filePath);
});

app.get("/.well-known/apple-app-site-association", (req, res) => {
  const filePath = path.join(
    __dirname,
    ".well-known",
    "apple-app-site-association"
  );

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

app.get("/", (req, res) => res.redirect("https://mytrackss.com"));

app.use(globalErrorHandler);
app.use(NotFoundHandler.handle);

module.exports = app;
