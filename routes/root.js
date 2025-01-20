import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  if (req.user) res.status(200).redirect("/home");
  else res.render("signin");
});

export const RootRouter = router;
