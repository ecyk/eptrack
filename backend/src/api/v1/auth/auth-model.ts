import mongoose, { type Document, Schema } from "mongoose";

export interface Session extends Document {
  user_id: string;
  expires_at: Date;
}

const sessionSchema = new Schema<Session>(
  {
    _id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

export const sessionModel = mongoose.model<Session>("Session", sessionSchema);

export interface User extends Document {
  google_id: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  created_at?: Date;
}

const userSchema = new Schema<User>(
  {
    _id: {
      type: String,
      required: true,
    },
    google_id: {
      type: String,
      required: true,
    },
    given_name: String,
    family_name: String,
    picture: String,
    email: {
      type: String,
      required: true,
    },
    email_verified: Boolean,
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export const userModel = mongoose.model<User>("User", userSchema);
