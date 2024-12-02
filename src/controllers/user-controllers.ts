import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { compare, hash } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();

    return res.status(200).json({ message: "OK", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).send("User already registered.");
    }

    const hashedPassword = await hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Clear previous cookie
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      // domain: "gen-chat-bot.netlify.app",
      httpOnly: true,
      signed: true,
    });

    const token = createToken(user._id.toString(), user.email, "7d");

    // Create a time when the cookie should expire (7 days, same as token)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Send cookie with token to frontend
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      // domain: "gen-chat-bot.netlify.app",
      expires,
      httpOnly: true,
      signed: true,
    });

    return res
      .status(201)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User is not registered.");
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).send("Incorrect credentials.");
    }

    // Clear previous cookie
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      httpOnly: true,
      signed: true,
      sameSite: false
    });

    const token = createToken(user._id.toString(), user.email, "7d");

    // Create a time when the cookie should expire (7 days, same as token)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Send cookie with token to frontend
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      expires,
      httpOnly: true,
      signed: true,
      sameSite: 'none', // required for cross-site cookies
      secure: true, // ensures cookie is sent over HTTPS
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // GET REQ, so must get id from locals (set in verifyToken in token-manager)
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // GET REQ, so must get id from locals (set in verifyToken in token-manager)
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Clear previous cookie
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      // domain: "gen-chat-bot.netlify.app",
      httpOnly: true,
      signed: true,
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
