import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

const COOKIE_OPTIONS = {
  HTTPS: true,
  MAXAGE: 24 * 60 * 60 * 1000,
  ENCRYPTED_NUM: {
    MIN: 1000,
    MAX: 100000,
  },
  SEPARATOR: "     ",
};

const COOKIES = {
  USER_ID: "usrID",
  ENCRYPTED_NUM: "__enc",
};

const URL = `http://${process.env.HOST}:${process.env.PORT}`;

const APP = {
  PORT,
  MONGO_URI,
  COOKIE_OPTIONS,
  COOKIES,
  URL,
};

export default APP;
