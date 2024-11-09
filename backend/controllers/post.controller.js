import sharp from "sharp";
import cloudinary from "../utils/cloudnary.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";

export const addPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({
        message: "Image is required",
        success: false,
      });
    }

    // Check if image.buffer exists (additional validation)
    if (!image.buffer) {
      return res.status(400).json({
        message: "Invalid image format",
        success: false,
      });
    }

    // Optimize image using sharp
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;

    // Upload the image to Cloudinary
    let cloudResponse;
    try {
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    } catch (uploadError) {
      return res.status(500).json({
        message: "Image upload failed to Cloudinary",
        success: false,
        error: uploadError.message,
      });
    }

    // Create a new post
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    // Associate the post with the user (author)
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    // Return response with the newly created post
    return res.status(201).json({
      message: "New post added successfully",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while creating the post",
      success: false,
      error: error.message,
    });
  }
};

// get all post

export const getAllPost = async(req, res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}
