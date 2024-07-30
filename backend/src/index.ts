import { app } from "./app";
import logger from "./logger";

const port = process.env.PORT ?? 3000;

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

const unexpectedErrorHandler = (err: Error): void => {
  logger.error(err);
  process.exit(1);
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

const signalHandler = (signal: string): void => {
  logger.error(signal);
  server.close(() => {
    logger.info("Server closed");
    process.kill(process.pid, signal);
  });
  setTimeout(() => {
    process.kill(process.pid, signal);
  }, 10000).unref();
};

process.on("SIGINT", signalHandler);
process.on("SIGTERM", signalHandler);
