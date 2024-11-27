import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { ChatCompletionRequestMessage, OpenAIApi } from "openai";

export const generateChatCompleion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  try { 
    const user = await User.findById(res.locals.jwtData.id);
  
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
  
    // --> GRAB CHATS
    // get chats from user modal
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];
    // add lastest chat to the chats array (above)
    chats.push({ content: message, role: "user" });
    // push the lastest chat to user modal
    user.chats.push({ content: message, role: "user" });
  
    // --> SEND ALL CHATS WITH NEW ONE TO OPENAI API
    const config = configureOpenAI();
    const openai = new OpenAIApi(config);
  
    // --> GET RESPONSE
    const chatResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chats,
    });
    // push the lastest chat (from openai api) to user modal
    user.chats.push(chatResponse.data.choices[0].message);
    await user.save();
    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const sendChatsToUser = async (
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
      .json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
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

    //@ts-ignore
    user.chats = [];
    await user.save();

    return res
      .status(200)
      .json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
