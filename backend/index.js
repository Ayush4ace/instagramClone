import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({});
import connectDb from "./config/db.js";
import userRouter from "../backend/routes/user.routes.js"
import postRoute from "../backend/routes/post.routes.js"
import messageRoute from "../backend/routes/message.routes.js"

const app = express();

// middlewares 

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 8080;

// apis

app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

app.listen(PORT, ()=>{
    console.log(`server is listening at port ${PORT}`);
    connectDb();
})