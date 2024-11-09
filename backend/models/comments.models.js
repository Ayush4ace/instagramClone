import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
    text: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
}, {timestamps: true});

export const Comment = mongoose.model('Comment', commentSchema);