import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

const COOKIE_OPTIONS = {
  HTTPS: true,
  MAXAGE: 24 * 60 * 60 * 1000,
};

const APP = {
  PORT,
  MONGO_URI,
  COOKIE_OPTIONS,
};

export default APP;
