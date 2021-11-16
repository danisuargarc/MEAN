const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/authcheck");
const extractFile = require("../middleware/file");
const PostController = require("../controllers/post");

router.post("", authCheck, extractFile, PostController.createPost);

router.get("", PostController.getPosts);

router.get("/:id", PostController.getPost);

router.put("/:id", authCheck, extractFile, PostController.editPost);

router.delete("/:id", authCheck, PostController.deletePost);

module.exports = router;
