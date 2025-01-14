import { Router } from "express";
import Auth from "../middlewares/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    let cookies = req.cookies;
    let match = await Auth.validate(cookies.usrID, cookies.__enc);
    if (match) {
      res.status(200).redirect("/home");
    } else {
      res.render("signin");
    }
  } catch {
    res.render("signin");
  }
});

export const RootRouter = router;
