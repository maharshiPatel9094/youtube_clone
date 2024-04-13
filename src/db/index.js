import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// connecting DataBase
// Always Use ASYNC AWAIT
// Always use try catch
const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(`\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection error", error);
    process.exit(1);
  }
};


export default connectDb