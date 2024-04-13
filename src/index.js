import dotenv from "dotenv"
import connectDb from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: './env'
})



connectDb()
.then(( )=> {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`);
  })
})
.catch((error)=>{
  console.log("MONGODB connection error !!!", error)
})




















/*
import express from "express"
const app = express()

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error)=> {
        console.log("ERR: DATABASE CANT TALK TO APP");
        throw error
    })

app.listen(process.env.PORT, ()=> {
    console.log(`App is Listeing on PORT ${process.env.PORT}`);
})

  } catch (error) {
    console.error("ERROR: ", error);
    throw err;
  }
})();
*/