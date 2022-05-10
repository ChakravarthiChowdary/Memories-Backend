import { Router } from "express";
import { check } from "express-validator";

import { postMemory } from "../controllers/posts";
import checkAuth from "../middlewares/authCheck";

const router = Router();

router.use(checkAuth);

router.get("/", (req, res, next) => {
  res.send("Posts fetch successful");
});

router.post(
  "/",
  [
    check("title")
      .not()
      .isEmpty()
      .withMessage("Title cannot be blank for a post."),
    check("description")
      .isLength({ min: 8 })
      .withMessage("Description cannot be blank for a post."),
    check("photoUrl")
      .not()
      .isEmpty()
      .withMessage("Keep atleast one photo for your memory."),
  ],
  postMemory
);

export default router;
