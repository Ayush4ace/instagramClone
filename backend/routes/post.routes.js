import express from "express";
import { addComment, addPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentOfPost, getUserPost, likePost } from "../controllers/post.controller";

const router = express.Router();

router.route("/addPost").post(addPost);
router.route("/getAllPost").get(getAllPost);
router.route("/get/:id").get(getUserPost);
router.route("/like/:id").post(likePost);
router.route("/dislike/:id").post(dislikePost);
router.route("/comment/add").post(addComment);
router.route("/comment/add/:id").get(getCommentOfPost);
router.route("/post/delete").delete(deletePost);
router.route("/post/bookmark").post(bookmarkPost);

export default router;