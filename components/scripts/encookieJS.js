import { User } from "../../models/User.js";
import crypto from "../../utils/crypto.js";

const getRandomNumberForCookie = () => {
  return 1000 + Math.floor(Math.random() * 21000);
};

const createCookie = async (name) => {
  let randomNum = getRandomNumberForCookie();
  const res = await User.updateOne(
    { username: name },
    { randomNumber: randomNum }
  );
  if (res.acknowledged) {
    let encryptedNum = crypto.crypt(name, randomNum.toString());
    let cookie = name + "     " + randomNum;
    cookie = crypto.crypt(encryptedNum, cookie);
    return [cookie, encryptedNum];
  }
};

const checkCookie = async (cookie, encryptedNum) => {
  try {
    cookie = crypto.decrypt(encryptedNum, cookie).split("     ");
    let user = cookie[0];
    let randomNum = cookie[1];
    let res = await User.findOne({
      username: user,
      randomNumber: Number(randomNum),
    });
    if (res) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const getUser = async (cookies) => {
  let cookie = cookies.usrID,
    encryptedNum = cookies.__enc;
  cookie = crypto.decrypt(encryptedNum, cookie).split("     ");
  let user = cookie[0];
  let randomNum = cookie[1];
  let usr = await User.findOne({
    username: user,
    randomNumber: Number(randomNum),
  });
  return usr;
};

const options = {
  https: true,
  maxAge: 24 * 60 * 60 * 1000,
};

export const Cookies = { createCookie, checkCookie, options, getUser };
