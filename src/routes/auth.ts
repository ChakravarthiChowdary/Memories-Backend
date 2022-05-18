import { Router } from "express";
import { check } from "express-validator";
import {
  forgotPassword,
  signInUser,
  signUpUser,
  updateProfile,
} from "../controllers/auth";

const router = Router();

router.post(
  "/signup",
  [
    check("username").notEmpty().withMessage("User name cannot be empty."),
    check("password")
      .isAlphanumeric()
      .withMessage("Password should be combination of characters."),
    check("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm password is missing in body."),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password should have min length of 8 characters."),
    check("email").isEmail().withMessage("Email is not valid."),
  ],
  signUpUser
);

router.post(
  "/signin",
  [
    check("email").isEmail().withMessage("Email is not valid."),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password must not be left blank."),
  ],
  signInUser
);

router.patch(
  "/updateProfile",
  [
    check("username").not().isEmpty().withMessage("Username must not be blank"),
    check("passwordUpdated")
      .not()
      .isEmpty()
      .withMessage("Password updated filed must not be blank"),
  ],
  updateProfile
);

router.patch(
  "/forgotpassword",
  [
    check("email").isEmail().withMessage("Email is not valid."),
    check("oldPassword")
      .not()
      .isEmpty()
      .withMessage("Old password not provided."),
    check("newPassword")
      .not()
      .isEmpty()
      .withMessage("New password not provided."),
    check("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm password not provided."),
  ],
  forgotPassword
);

export default router;
