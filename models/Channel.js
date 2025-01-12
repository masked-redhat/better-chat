import mongoose, { Schema } from "mongoose";

const ChannelSchema = new Schema({
  name: String,
  isPerson: Boolean,
  dateCreated: Date,
  members: [String],
});

export const Channel = mongoose.model("Channel", ChannelSchema);
