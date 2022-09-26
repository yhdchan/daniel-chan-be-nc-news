const express = require("express");
const { deleteCommentById } = require("../controllers/comments.controllers");

const commentsRouter = express.Router();

commentsRouter
	.delete('/:comment_id',  deleteCommentById);

module.exports = commentsRouter;