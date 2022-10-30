const express = require("express");
const {
  deleteCommentById,
  patchCommentVoteById,
} = require("../controllers/comments.controllers");

const commentsRouter = express.Router();

commentsRouter
  .route("/:comment_id")
  .patch(patchCommentVoteById)
  .delete(deleteCommentById);

module.exports = commentsRouter;
