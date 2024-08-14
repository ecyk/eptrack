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
