const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./app/middleware/globalErrorHandler");
const routes = require("./app/routes");
const NotFoundHandler = require("./error/NotFoundHandler");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5175",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/", routes);

app.get("/.well-known/assetlinks.json", (req, res) => {
  const filePath = path.join(__dirname, "/.well-known/assetlinks.json");
  res.sendFile(filePath);
});

app.get("/", async (req, res) => {
  res.json("Welcome to TrackTrek");
});

app.use(globalErrorHandler);
app.use(NotFoundHandler.handle);

module.exports = app;
