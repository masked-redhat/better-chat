import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

const APP = {
  PORT,
  MONGO_URI,
};

export default APP;
