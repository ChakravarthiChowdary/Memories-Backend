import { Router } from "express";
import { check } from "express-validator";

import {
  addOrRemoveLikedOrFavUserToPost,
  getAllMemories,
  getLikedOrFavPostsOfUser,
  getMemory,
  getMyPosts,
  postMemory,
} from "../controllers/posts";
import checkAuth from "../middlewares/authCheck";

const router = Router();

router.use(checkAuth);

router.get("/", getAllMemories);

router.post(
  "/",
  [
    check("title")
      .not()
      .isEmpty()
      .withMessage("Title cannot be blank for a post."),
    check("description")
      .isLength({ min: 8 })
      .withMessage(
        "Description should have min length of 8 characters for a post."
      ),
    check("photoUrls")
      .not()
      .isEmpty()
      .withMessage("Keep atleast one photo for your memory."),
  ],
  postMemory
);

router.get("/:id", getMemory);

router.post(
  "/addOrRemoveLikedOrFavUserToPost",
  [
    check("postId")
      .not()
      .isEmpty()
      .withMessage("Post id must be provided to like the post."),
    check("likedOrFav")
      .not()
      .isEmpty()
      .withMessage("LikedUsers or FavUsers should be sent in body of request."),
  ],
  addOrRemoveLikedOrFavUserToPost
);

router.get(
  "/getLikedOrFavPostsOfUser/:likedOrFav/:id",
  getLikedOrFavPostsOfUser
);

router.get("/getMyPosts/:id", getMyPosts);

export default router;
