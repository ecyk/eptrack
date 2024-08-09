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

export interface Tag {
  name: string;
}

export interface Media {
  mediaId: number;
  tags: number[];
  watched?: boolean;
  episodes?: number[];
}

export interface User extends Document {
  google_id: string;
  tags: Tag[];
  medias: Media[];
  created_at?: Date;
}

const tagSchema = new Schema({
  name: { type: String, required: true },
});

const mediaSchema = new Schema(
  {
    mediaId: { type: Number, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    watched: { type: Boolean, default: false },
    episodes: [{ type: Number }],
  },
  { _id: false }
);

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
    tags: [tagSchema],
    medias: [mediaSchema],
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export const userModel = mongoose.model<User>("User", userSchema);
