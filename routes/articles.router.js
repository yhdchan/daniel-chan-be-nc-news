const express = require("express");
const {
  getArticles,
  getArticleById,
  patchArticleVoteById,
  getCommentsByArticleId,
  postCommentsByArticleId,
  postArticle,
  deleteArticleById,
} = require("../controllers/articles.controllers");

const articlesRouter = express.Router();

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVoteById)
  .delete(deleteArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentsByArticleId);

module.exports = articlesRouter;
