import { Channel } from "../../models/Channel.js";
import { Chats } from "../../models/Chats.js";

const getChannelType = async (channelID) => {
    try {
        let channel = await Channel.findOne({ name: channelID });
        if (channel) {
            return channel.isPerson;
        } else {
            return 403;
        }
    } catch {
        return 403;
    }
}

const isChannel = async (channelName) => {
    let channel = await Channel.findOne({ name: channelName });
    if (channel != null) {
        return true;
    }
    return false;
}

const getChannelDetails = async (channelID) => {
    let channel = await Channel.findById(channelID);
    if (channel) {
        return channel;
    } else {
        return false;
    }
}

const getChannelChatfromFriends = async (username, toMatch) => {
    let chatCh = await Chats.findOne({ name: username + ' ' + toMatch });
    if (!chatCh) {
        chatCh = await Chats.findOne({ name: toMatch + ' ' + username });
    }
    return chatCh;
}
const getChannelChatfromChannels = async (name) => {
    let chatCh = await Chats.findOne({ name: `#${name}`.replace(' ', '_') });
    return chatCh;
}

const createChannel = async (channelName, toAdd = []) => {
    let channel = await Channel.create({ name: channelName, isPerson: false, dateCreated: new Date() });
    for (const user of toAdd) {
        channel.members.push(user.username);
        user.channels.push(`#${channelName}`);
        user.save();
    }
    channel.save();
    await Chats.create({ name: `#${channelName}`.replace(' ', '_') })
    return channel;
}

export const Channels = { getChannelType, getChannelDetails, getChannelChatfromFriends, createChannel, isChannel, getChannelChatfromChannels };