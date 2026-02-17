import dotenv from "dotenv";
dotenv.config();


console.log("ENV TEST:", process.env.GEMINI_API_KEY);
import { connectDB } from "./config/db.js";

import app from "./app.js";

//DataBase Connection
connectDB();

//Start server
const PORT=process.env.PORT;

const server=app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})




//Error handling
process.on("unhandledRejection",(err)=>{
    console.error(`Unhandled Rejection :${err.message}`);
    server.close(()=>process.exit(1))
})
process.on("uncaughtException",(err)=>{
    console.error(`uncaught Exception :${err.message}`);
    process.exit(1);
})

export default server;