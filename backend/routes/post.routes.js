import express from "express";
import { addComment, addPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentOfPost, getUserPost, likePost } from "../controllers/post.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

router.route("/addPost").post(isAuthenticated, upload.single('image'), addPost);
router.route("/all").get(isAuthenticated, getAllPost);
router.route("/userPost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").get(isAuthenticated, getCommentOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").post(isAuthenticated, bookmarkPost);

export default router;