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
        const post = await Post.find().sort({createdAt:-1}).populate({path: 'author', select: 'username, profilePic'})
        .populate({
          path: "comments",
          sort: {createdAt: -1},
          populate: {
            path: "author",
            select: 'username, profilePic'
          }
        });

        return res.status(200).json({
          post,
          success: true
        })
    } catch (error) {
        console.log(error);
    }
}


// get user post

export const getUserPost = async(req, res)=>{
  try {
    const authorId = req.id;
    const post = await Post.find({author: authorId}).sort({createdAt: -1}).populate({
      path: "author",
      select: "username, profilePic"
    }).populate({
      path: "comments",
      sort: {createdAt: -1},
      populate: {
        path: 'author',
        select: 'username, profilePic'
      }
    });
    return res.status(200).json({
      post,
      success: true
    })
  } catch (error) {
    console.log(error);
  }
}


// likepost
export const likePost = async(req, res)=>{
  try {
    const likeKarnewalekiuserId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message: "post not found",
        success: false
      });
    }
    await post.updateOne({$addToSet: {likes: likeKarnewalekiuserId}});
    await post.save();

    // socket io real time notification

    return res.status(200).json({message: "post liked", success: true});
  } catch (error) {
    console.log(error);
  }
}

// dislike post 

export const dislikePost = async (req, res)=>{
  try {
    const dislikekarnekiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message: "post not found",
        success: false
      });
    }
    await post.updateOne({$pull: {likes: dislikekarnekiId}});
    await post.save();

    return res.status(200).json({
      messaage: "post disliked",
      success: true
    });
  } catch (error) {
    console.log(error);
  }
}


// add comment 
export const addComment = async (req, res)=>{
  try {
    const postId = req.params.id;
    const commentkarneWalekiId = req.id;

    const {text} = req.body;
    const post = await Post.findById(postId);
    if(!text){
      return res.status(400).json({
        messaage: "comment is required",
        success: false
      });
    }
    const comment = await Comment.create({
      text,
      author: commentkarneWalekiId,
      post: postId
    }).populate({
      path: "author",
      select: "username, profilePic"
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      messaage: "comment added",
      success: true
    });

  } catch (error) {
    console.log(error);
  }
}

// in a partiuclar post get all comment

export const getCommentOfPost = async(req, res)=>{
  try {
    const postId = req.params.id;
    const comments = await Comment.find({post: postId}).populate('author', 'username', 'profilePic');
    if(!comments){
      return res.status(400).json({
        messaage: "no comment found for this post",
        success: false
      });
    }
    return res.status(200).json({
      comments,
      success: true
    });
  } catch (error) {
    console.log(error);
  }
}

// delete a post 

export const deletePost = async(req, res)=>{
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message: "post not found",
        success: false
      });
    }

    if(post.author.toString() !== authorId){
      return res.status(403).json({
        message: "unauthorized",
        success: false
      });
    }
    await Post.findByIdAndDelete(postId);

    let user = await User.findById(authorId);
    user.posts = user.posts.filter(id=> id.toString() !== postId);
    await user.save();

    // delete associated comment 
    await Comment.deleteMany({post: postId});

    return res.status(200).json({
      messaage: "post deleted",
      success: true
    });
  } catch (error) {
    console.log(error);
  }
}


// bookmark post 

export const bookmarkPost = async(req, res)=>{
  const postId = req.params.id;
  const authorId = req.id;
  const post = await Post.findById(postId);
  if(!post){
    return res.status(404).json({
      messaage: "post not found",
      success: false
    });
  }

  const user = await User.findById(authorId);
  if(user.bookmarks.includes(post._id)){
    // remove from saved because it is already bookmarked
    await user.updateOne({$pull: {bookmarks: post._id}});
    await user.save();
    return res.status(200).json({
      type: "unsaved",
      messaage: "post removed from bookmarks",
      success: true
    });
  }
  else{
    // bookmark 
    await user.updateOne({$addToSet: {bookmarks: post._id}});
    await user.save();

    return res.status(200).json({
      messaage: "post saved successfully",
      type: "saved",
      success: true
    })
  }
}
