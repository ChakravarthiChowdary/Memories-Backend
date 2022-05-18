import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import JWT from "jsonwebtoken";

import HttpError from "../models/HttpError";
import User from "../schema/User";

export const signUpUser: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, confirmPassword, photoUrl } = req.body;

    if (password !== confirmPassword) {
      return next(new HttpError("Passwords does not match. Try again."));
    }

    const userExists = await User.find({ email: req.body.email }).exec();

    if (userExists.length > 0) {
      return next(new HttpError("User already exists. Try logging in again"));
    }

    const hashedPassword = await bcryptjs.hash(req.body.password, 12);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      photoUrl: photoUrl || "",
    });

    const result = await newUser.save();
    const resultObj = result.toObject({ getters: true });

    res.status(200).json({
      userInfo: {
        name: resultObj.username,
        id: resultObj.id,
        email: resultObj.email,
      },
      status: "Success",
    });
  } catch (error) {
    next(error);
  }
};

export const signInUser: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const userExists = await User.findOne({
      email: email,
    }).exec();

    if (!userExists) {
      return next(new HttpError("Username or password is incorrect.", 401));
    }

    const isValidPassword = await bcryptjs.compare(
      password,
      userExists.password
    );

    if (!isValidPassword) {
      return next(new HttpError("Username or password is incorrect", 401));
    }

    const token = JWT.sign(
      {
        email,
        id: userExists.id,
        username: userExists.username,
        photoUrl: userExists.photoUrl,
      },
      "A_REALLY_SUPER_SECRET_KEY",
      { expiresIn: "1h" }
    );

    const expiresIn = new Date();

    expiresIn.setTime(expiresIn.getTime() + 60 * 60 * 1000);

    res.status(200).json({
      userInfo: {
        username: userExists.toObject().username,
        id: userExists.toObject({ getters: true }).id,
        email: userExists.toObject().email,
        photoUrl: userExists.toObject().photoUrl,
        token,
        expiresIn,
      },
      status: "Success",
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    console.log(req.body);
    const userId = req.body.id;
    const username = req.body.username;
    const passwordUpdated = req.body.passwordUpdated;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!userId) {
      return next(new HttpError("User Id should be sent as part of body", 400));
    }

    if (!username && !passwordUpdated) {
      return next(new HttpError("Should change something", 400));
    }

    const user = await User.findOne({ _id: userId }).exec();

    if (!user) {
      return next(new HttpError("Something wrong with authentication", 403));
    }

    let hashedPassword;

    if (passwordUpdated) {
      if (!password || !confirmPassword) {
        return next(
          new HttpError(
            "Please provide password and confirm password to update.",
            400
          )
        );
      }

      if (password !== confirmPassword) {
        return next(
          new HttpError("Confirm password and password should be same.", 400)
        );
      }

      if (password.length < 8) {
        return next(
          new HttpError("Password should have min length of 8 characters.", 400)
        );
      }

      hashedPassword = await bcryptjs.hash(password, 12);
    }

    await User.findByIdAndUpdate(userId, {
      email: user.email,
      username,
      password: hashedPassword ? hashedPassword : user.password,
      photoUrl: user.photoUrl,
    });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
