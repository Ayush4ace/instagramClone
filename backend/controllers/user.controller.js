//sign up

import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudnary.js";

export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(404).json({
        message: "all fields are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "user already exists with this email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "user created succesfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        message: "all fields are required",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    const isPasswordMatch = bcrypt.compare(password, user.password);

    if (!user || !isPasswordMatch) {
      return res.status(400).json({
        message: "invalid credentials",
        success: false,
      });
    }

    const tokenData = { userId: user._id };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      gender: user.gender,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      bookmarks: user.bookmarks
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);
  }
};

// logout

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// get profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId);
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};


export const editProfile = async(req, res)=>{
  try {
    const userId =  req.id;
    const {bio, gender} = req.body;
    const profilePic = req.file;
    let cloudResponse;
    if(profilePic){
      const fileUri = getDataUri(profilePic);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
      
    }
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({
        message: "user not found",
        success: false
      });
    }

    if(bio) user.bio = bio;
    if(gender) user.gender = gender;
    if(profilePic) user.profilePic = cloudResponse.secure_url;

    await user.save();

    return res.status(201).json({
      message: "profile updated succesfully",
      success: true,
      user
    })

  } catch (error) {
    console.log(error);
  }
}

// const getSuggested user

export const getSuggestedUser = async(req, res)=>{
  try {
    const suggestedUser = await User.find({_id: {$ne: req.id}}).select("-password");
    if(!suggestedUser){
      return res.status(400).json({
        message: "currently do not have any users",
        success: false
      })
    }
    return res.status(200).json({
      success: true,
      users: suggestedUser
    })
  } catch (error) {
    console.log(error)
  }
}


// follow or unfollow

export const followOrUnfollow = async(req, res)=>{
  try {
    const followKarneWala = req.id;
    const jiskofollowKarunga = req.params.id;

    if(followKarneWala === jiskofollowKarunga){
      return res.status(400).json({
        message: "you cannot follow youself",
        success: false
      });
    }

    const user = await User.findById(followKarneWala);
    const targetUser = await User.findById(jiskofollowKarunga);

    if(!user || !targetUser){
      return res.status(400).json({
        message: "User not found",
        success: false
      });
    }
    const isFollowing = user.following.includes(jiskofollowKarunga);
    if(isFollowing){
      // unfollow
      await Promise.all([
        User.updateOne({_id: followKarneWala}, {$pull: {following: jiskofollowKarunga}}),
        User.updateOne({_id: jiskofollowKarunga}, {$pull: {followers: followKarneWala}})
      ]);

      return res.status(200).json({
        message: "unfollow successfully",
        success: true
      })
    }
    else{
      // follow
      await Promise.all([
        User.updateOne({_id: followKarneWala}, {$push: {following: jiskofollowKarunga}}),
        User.updateOne({_id: jiskofollowKarunga}, {$push: {followers: followKarneWala}})
      ]);

      return res.status(200).json({
        message: "followed successfully"
      })
    }
  } catch (error) {
    console.log(error);
  }
}