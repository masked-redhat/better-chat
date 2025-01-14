import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: String,
  password: String,
  randomNumber: String,
  notifications: [{ time: Number, text: String }],
  channels: [String],
});

export const User = mongoose.model("User", UserSchema);
