import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({});

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

app.listen(PORT, ()=>{
    console.log(`server is listening at port ${PORT}`)
})