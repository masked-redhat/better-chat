import mongoose from "mongoose";
import APP from "../constants/env.js";

export const connectToMongo = async () => {
  try {
    await mongoose.connect(APP.MONGO_URI);

    console.log("Connected to Mongo DB");
  } catch (err) {
    console.log(err);

    setTimeout(async () => {
      console.log("Retrying connection...");
      await connectToMongo();
    }, 4000);
  }
};

export const closeMongoConnection = async () => {
  try {
    await mongoose.connection.close();

    console.log("Closed connection to Mongo DB");
  } catch (err) {
    console.log(err);

    setTimeout(async () => {
      console.log("Retrying connection...");
      await closeMongoConnection();
    }, 4000);
  }
};

const mongo = {
  connect: connectToMongo,
  close: closeMongoConnection,
};

export default mongo;
