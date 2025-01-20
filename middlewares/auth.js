import APP from "../constants/env.js";
import { User } from "../models/User.js";
import crypto from "../utils/crypto.js";

const getRandomEncryptedNum = () => {
  return (
    APP.COOKIE_OPTIONS.ENCRYPTED_NUM.MIN +
    Math.floor(Math.random() * APP.COOKIE_OPTIONS.ENCRYPTED_NUM.MAX)
  );
};

const setupAuth = async (username) => {
  // set the encNum to user data
  const encNum = getRandomEncryptedNum().toString();
  let encCookie, encryptedNum;
  try {
    const res = await User.updateOne({ username }, { randomNumber: encNum });

    // encrypt the cookies and get a encrypted cookie with a encrypted number
    if (res.acknowledged === true) {
      encryptedNum = crypto.crypt(username, encNum);

      encCookie = crypto.crypt(
        encryptedNum,
        username + APP.COOKIE_OPTIONS.SEPARATOR + encNum
      );
    }
  } catch {}

  return { encCookie, encryptedNum };
};

const validate = async (req, res, next) => {
  // get the userId and encryptedNum from the cookies
  const cookies = req.cookies;
  const encCookie = cookies[APP.COOKIES.USER_ID],
    encryptedNum = cookies[APP.COOKIES.ENCRYPTED_NUM];

  try {
    // decrypt and get the username and encNum
    const decCookie = crypto
      .decrypt(encryptedNum, encCookie)
      .split(APP.COOKIE_OPTIONS.SEPARATOR);

    const [username, encNum] = decCookie;

    // find the user
    let user = await User.findOne({
      username,
      randomNumber: Number(encNum),
    });

    if (user) {
      req.user = {
        username: user.username,
        channels: user.channels,
        notifications: user.notifications,
      };
      next();
      return;
    }
  } catch (err) {
    console.log(err);
  }

  res.render("signin");
};

const Auth = { setupAuth, validate };

export default Auth;
