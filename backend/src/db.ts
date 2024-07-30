import mongoose from "mongoose";

import logger from "./logger";
import { env, mongoURI } from "./vars";

if (env === "development") {
  mongoose.set("debug", true);
}

function connectDB(): void {
  mongoose.connect(mongoURI).catch(() => {
    logger.error("Failed to connect to MongoDB");
    process.exit(1);
  });
}

export default connectDB;
