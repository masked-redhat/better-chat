import mongoose, { Schema } from "mongoose";

const data = new Schema({
    name: String,
    chats: [{
        user: String,
        text: String
    }]
})

export const Chats = mongoose.model('Chats', data);