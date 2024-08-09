import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { Google } from "arctic";
import { Lucia, TimeSpan } from "lucia";
import mongoose from "mongoose";

import { type User } from "./auth-model.js";
import config from "../../../config.js";

const adapter = new MongodbAdapter(
  mongoose.connection.collection("sessions"),
  mongoose.connection.collection("users")
);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(1, "w"),
  sessionCookie: {
    attributes: {
      secure: config.env === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      google_id: attributes.google_id,
    };
  },
});

export const google = new Google(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: User;
  }
}
