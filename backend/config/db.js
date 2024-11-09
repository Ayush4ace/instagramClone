import mongoose from "mongoose";

const connectDb = async(req, res)=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("database connected");
    } catch (error) {
        console.log("something went wrong");
    }
}

export default connectDb;