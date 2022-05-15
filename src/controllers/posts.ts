import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import HttpError from "../models/HttpError";
import Post from "../schema/Post";
import User from "../schema/User";

export const postMemory: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ _id: req.body.id }).exec();

    if (!user) {
      return next(
        new HttpError(
          "User not found. Something happened with authentication",
          403
        )
      );
    }

    if (!Array.isArray(req.body.photoUrls)) {
      return next(new HttpError("Photo urls should be sent as array", 400));
    }

    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      userId: req.body.id,
      createdDate: new Date(),
      likes: 0,
      userPhoto: user.photoUrl,
      photoUrls: req.body.photoUrls,
      favCount: 0,
    });

    const result = await post.save();
    const resultObj = result.toObject({ getters: true });
    res.status(200).json(resultObj);
  } catch (error) {
    next(error);
  }
};

export const getAllMemories: RequestHandler = async (req, res, next) => {
  try {
    const result = await Post.find().select("-likedUsers").exec();

    res.status(200).json({
      posts: result,
      length: result.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemory: RequestHandler = async (req, res, next) => {
  try {
    const memoryId = req.params.id ? req.params.id : null;

    if (!memoryId) {
      return next(
        new HttpError(
          "There is some problem with post. Please try again later.",
          404
        )
      );
    }

    const result = await Post.findOne({ _id: memoryId }).exec();

    if (!result) {
      return next(
        new HttpError(
          "There is some problem with post. Please try again later.",
          404
        )
      );
    }

    const resultObj = result?.toObject({ getters: true });
    res.status(200).json(resultObj);
  } catch (error) {
    next(error);
  }
};

export const addOrRemoveLikedOrFavUserToPost: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.body.id;
    const postId = req.body.postId;
    const likedOrFav = req.body.likedOrFav;

    let post = await Post.findOne({ _id: postId }).exec();
    const user = await User.findOne({ _id: userId }).exec();

    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    if (!user) {
      return next(
        new HttpError(
          "User not found. Something wrong with authentication.",
          401
        )
      );
    }

    if (likedOrFav === "LikedUsers") {
      if (post.likedUsers.findIndex((user) => user === userId) > -1) {
        post.likes = post.likes - 1;
        post.likedUsers = post.likedUsers.filter((user) => user !== userId);
      } else {
        post.likes = post.likes + 1;
        post.likedUsers = [...post.likedUsers, userId];
      }
    } else if (likedOrFav === "FavUsers") {
      if (post.favUsers.findIndex((user) => user === userId) > -1) {
        post.favCount = post.favCount - 1;
        post.favUsers = post.favUsers.filter((user) => user !== userId);
      } else {
        post.favCount = post.favCount + 1;
        post.favUsers = [...post.favUsers, userId];
      }
    } else {
      return next(
        new HttpError("LikedUsers or FavUsers should be sent in body", 400)
      );
    }

    const result = await post.save();
    const resultObj = result.toObject({ getters: true });

    res.status(200).json(resultObj);
  } catch (error) {
    next(error);
  }
};

export const getLikedOrFavPostsOfUser: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.params.id ? req.params.id : null;
    const likedOrFav = req.params.likedOrFav;

    if (!likedOrFav) {
      return next(new HttpError("Liked or fav param not sent.", 400));
    }

    if (!userId) {
      return next(new HttpError("User id should be sent as param", 401));
    }

    const user = await User.findOne({ _id: userId }).exec();

    if (!user) {
      return next(
        new HttpError(
          "User not found. Something wrong with authentication.",
          401
        )
      );
    }

    let posts;
    if (likedOrFav === "LikedUsers") {
      posts = await Post.find({ likedUsers: userId }).select("-likedUsers");
      res.status(200).json({ likedPosts: posts, length: posts.length });
    } else if (likedOrFav === "FavUsers") {
      posts = await Post.find({ favUsers: userId }).select("-favUsers");
      res.status(200).json({ favPosts: posts, length: posts.length });
    } else {
      return next(
        new HttpError("LikedUsers or FavUsers should be sent as param", 400)
      );
    }
  } catch (error) {
    next(error);
  }
};

export const getMyPosts: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return next(
        new HttpError("Please provide user id as param to fetch posts.", 400)
      );
    }

    const user = await User.findOne({ _id: userId }).exec();

    if (!user) {
      return next(new HttpError("Something wrong with authentication.", 403));
    }

    const posts = await Post.find({ userId: userId })
      .select(["-likedUsers", "-favUsers"])
      .exec();

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
