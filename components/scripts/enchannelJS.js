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

const getChannelDetails = async (channelID) => {
    let channel = await Channel.findById(channelID);
    if (channel) {
        return channel;
    } else {
        return false;
    }
}

const getChannelChatfrom = async (username, toMatch) => {
    let chatCh = await Chats.findOne({ name: username + ' ' + toMatch });
    if (!chatCh) {
        chatCh = await Chats.findOne({ name: toMatch + ' ' + username });
    }
    return chatCh;
}

export const Channels = { getChannelType, getChannelDetails, getChannelChatfrom };