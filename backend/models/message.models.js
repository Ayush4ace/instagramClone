import mongoose from "mongoose";
import { User } from "./user.models.js";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    }
}, {timestamps: true});

export const Message = mongoose.model('Message', messageSchema);