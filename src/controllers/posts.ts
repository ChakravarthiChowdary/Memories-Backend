import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import Post from "../schema/Post";

export const postMemory: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      userId: req.body.id,
      createdDate: new Date(),
      likes: 0,
    });

    const result = await post.save();
    const resultObj = result.toObject({ getters: true });
    res.status(200).json(resultObj);
  } catch (error) {
    next(error);
  }
};
