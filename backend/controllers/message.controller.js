// for chatting 
import {Conversation} from "../models/conversation.models.js"
export const sendMessage = async(req, res)=>{
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {message} = req.body;

        let conversation = await Conversation.findOne({participants: {$all: [senderId, receiverId]}});
        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }
        const newMessage = await conversation.messages.create({
            senderId,
            receiverId,
            message
        });
        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        await Promise.all([
            conversation.save(),
            newMessage.save()
        ])

        // implement socket io

        return res.status(201).json({
            success: true,
            newMessage
        })
    } catch (error) {
        console.log(error);
    }
}

// get message 
export const getMessage = async(req, res)=>{
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        let conversation = await Conversation.findOne({participants: {$all: [senderId, receiverId]}});
        if(!conversation){
            return res.status(404).json({
                message: "conversation not found",
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            messages: conversation?.messages
        });
    } catch (error) {
        console.log(error);
    }
}