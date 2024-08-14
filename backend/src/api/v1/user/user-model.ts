import mongoose, { type Document, Schema } from "mongoose";

export interface Tag {
  tagId: number;
  name: string;
}

export enum MediaType {
  TV = "tv",
  Movie = "movie",
}

export interface UserMedia {
  mediaId: number;
  type: MediaType;
  tags: number[];
  watchedEpisodes: number[];
}

export interface User extends Document {
  google_id: string;
  tags: Tag[];
  medias: UserMedia[];
  created_at?: Date;
}

const tagSchema = new Schema(
  {
    tagId: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const mediaSchema = new Schema(
  {
    mediaId: { type: Number, required: true },
    type: { type: String, enum: Object.values(MediaType), required: true },
    tags: [{ type: Number }],
    watchedEpisodes: [{ type: Number }],
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
