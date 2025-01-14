import { Router } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { Password } from "../components/scripts/enpassJS.js";
import Auth from "../middlewares/auth.js";
import APP from "../constants/env.js";
import { USR } from "../components/scripts/enuserJS.js";

const router = Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const cookieOptions = {
  https: APP.COOKIE_OPTIONS.HTTPS,
  maxAge: APP.COOKIE_OPTIONS.MAXAGE,
};

router.post("/signup", async (req, res) => {
  let user = req.body.username;
  let pass = req.body.password;

  let available = await USR.checkUserName(user);

  if (!available) {
    res.status(400).json({ status: false });
    return;
  }

  let cookies = await Password.hashPasswordAndSave(user, pass);

  if (cookies) {
    res
      .status(200)
      .cookie(APP.COOKIES.USER_ID, cookies.encCookie, cookieOptions)
      .cookie(APP.COOKIES.ENCRYPTED_NUM, cookies.encryptedNum, cookieOptions)
      .json({ status: true });
  } else {
    res.status(403).json({ status: false });
  }
});

router.post("/login", async (req, res) => {
  let user = req.body.username;
  let pass = req.body.password;

  let match = await Password.checkPassword(user, pass);

  if (match) {
    let cookies = await Auth.setupAuth(user);
    res
      .status(200)
      .cookie(APP.COOKIES.USER_ID, cookies[0], APP.COOKIE_OPTIONS)
      .cookie(APP.COOKIES.ENCRYPTED_NUM, cookies[1], APP.COOKIE_OPTIONS)
      .json({ status: true });
  } else {
    res.status(403).json({ status: false });
  }
});

router.get("/logout", (req, res) => {
  try {
    res.clearCookie(APP.COOKIES.USER_ID);
    res.clearCookie(APP.COOKIES.ENCRYPTED_NUM);
    res.send("logged out");
  } catch {
    res.status(403).json({ status: false });
  }
});

export const AuthRouter = router;
