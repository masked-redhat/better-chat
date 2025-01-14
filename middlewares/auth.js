import APP from "../constants/env.js";
import { User } from "../models/User.js";
import crypto from "../utils/crypto.js";

const getRandomEncryptedNum = () => {
  return (
    APP.COOKIE_OPTIONS.ENCRYPTED_NUM.MIN +
    Math.floor(Math.random() * APP.COOKIE_OPTIONS.ENCRYPTED_NUM.MAX)
  );
};

const setupAuth = async (name) => {
  const encNum = getRandomEncryptedNum().toString();
  const res = await User.updateOne({ username: name }, { encNumber: encNum });
  let encCookie, encryptedNum;
  if (res.acknowledged) {
    encryptedNum = crypto.crypt(name, encNum);
    encCookie = crypto.crypt(
      encryptedNum,
      name + APP.COOKIE_OPTIONS.SEPARATOR + encNum
    );
  }
  return { encCookie, encryptedNum };
};

const validate = async (encCookie, encryptedNum) => {
  try {
    const decCookie = crypto
      .decrypt(encryptedNum, encCookie)
      .split(APP.COOKIE_OPTIONS.SEPARATOR);

    const [username, encNum] = decCookie;

    let res = await User.findOne({
      username,
      encNumber: Number(encNum),
    });
    if (res) {
      return true;
    }
  } catch (err) {
    console.log(err);
  }

  return false;
};

const getUserFromCookies = async (cookies) => {
  const { encCookie, encryptedNum } = cookies;
  const decCookie = crypto
    .decrypt(encryptedNum, encCookie)
    .split(APP.COOKIE_OPTIONS.SEPARATOR);

  const [username, encNum] = decCookie;

  let user = await User.findOne({
    username,
    encNumber: Number(encNum),
  });
  return user;
};

const Auth = { setupAuth, validate, getUser: getUserFromCookies };

export default Auth;
