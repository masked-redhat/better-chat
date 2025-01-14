import { Router } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import Password from "../components/scripts/password.js";
import Auth from "../middlewares/auth.js";
import APP from "../constants/env.js";
import User from "../components/scripts/user.js";

const router = Router();

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const cookieOptions = {
  https: APP.COOKIE_OPTIONS.HTTPS,
  maxAge: APP.COOKIE_OPTIONS.MAXAGE,
};

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const usernameAvailable = await User.isUsernameAvailable(username);

  if (!usernameAvailable) {
    res.status(400).json({ status: false });
    return;
  }

  const userSaved = await Password.hashAndSave(username, password);

  if (userSaved) {
    const cookies = await Auth.setupAuth(username);
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
  const { username, password } = req.body;

  let match = await Password.check(username, password);

  if (match) {
    const cookies = await Auth.setupAuth(username);
    res
      .status(200)
      .cookie(APP.COOKIES.USER_ID, cookies.encCookie, cookieOptions)
      .cookie(APP.COOKIES.ENCRYPTED_NUM, cookies.encryptedNum, cookieOptions)
      .json({ status: true });
  } else {
    res.status(403).json({ status: false });
  }
});

router.get("/logout", (_, res) => {
  try {
    res.clearCookie(APP.COOKIES.USER_ID);
    res.clearCookie(APP.COOKIES.ENCRYPTED_NUM);
    res.status(204);
  } catch {
    res.status(403).json({ status: false });
  }
});

export const AuthRouter = router;
