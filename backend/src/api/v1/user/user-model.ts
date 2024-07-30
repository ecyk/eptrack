import mongoose, { type Document, Schema } from "mongoose";

export interface User extends Document {
  username: string;
  hashedPassword: string;
  createdAt?: Date;
}

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userModel = mongoose.model<User>("User", userSchema);

export default userModel;
