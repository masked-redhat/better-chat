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
};

const COOKIES = {
  USER_ID: "usrID",
  ENCRYPTED_NUM: "__enc",
};

const APP = {
  PORT,
  MONGO_URI,
  COOKIE_OPTIONS,
  COOKIES,
};

export default APP;
