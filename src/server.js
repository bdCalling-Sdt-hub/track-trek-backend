const { errorLogger, logger } = require("./shared/logger");
const connectDB = require("./connection/connectDB");
const config = require("./config");
const app = require("./app");

async function main() {
  try {
    await connectDB();
    logger.info(`DB Connected Successfully at ${new Date().toLocaleString()}`);

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);

    const server = app.listen(port, config.base_url, () => {
      logger.info(`App listening on http://${config.base_url}:${config.port}`);
    });

    process.on("unhandledRejection", (error) => {
      errorLogger.error("Unhandled Rejection:", error);
      // process.exit(1);
    });

    process.on("uncaughtException", (error) => {
      errorLogger.error("Uncaught Exception:", error);
      // process.exit(1);
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received");
      // server.close(() => process.exit(0));
    });
  } catch (err) {
    errorLogger.error("Main Function Error:", err);
    // process.exit(1);
  }
}

main();
