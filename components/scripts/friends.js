import { User } from "../../models/User.js";
import { Channel } from "../../models/Channel.js";

const getUserFriendsAndChannels = async (userChannels) => {
  let channels = [];
  let frndsG = [];
  for (const channel of userChannels) {
    if (!channel.startsWith("@")) {
      channels.push(channel);
    } else {
      frndsG.push(channel);
    }
  }
  let data = {};
  data["channels"] = channels;
  data["friends"] = frndsG;
  return data;
};

const getFriendsSearch = async (user, toMatch) => {
  let regex = new RegExp(toMatch);
  let match = await User.find({ username: { $regex: regex } });
  let data = [];
  for (const usr of match) {
    if (
      usr.username != user.username &&
      !user.channels.includes(`@${usr.username}`)
    ) {
      data.push({ user: usr.username, type: "f" });
    }
  }
  return data;
};

const getChannelsSearch = async (toMatch) => {
  let regex = new RegExp(toMatch);
  let match = await Channel.find({ name: { $regex: regex } });
  let data = [];
  for (const usr of match) {
    if (!usr.isPerson) {
      data.push({ channel: usr.name, type: "c" });
    }
  }
  return data;
};

export const FriendsAndChannels = {
  getUserFriendsAndChannels,
  getFriendsSearch,
  getChannelsSearch,
};

export default FriendsAndChannels;
