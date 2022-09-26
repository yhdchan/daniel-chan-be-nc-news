const express = require("express");
const { getArticles, getArticleById, patchArticleVoteById, getCommentsByArticleId, postCommentsByArticleId } = require("../controllers/articles.controllers");

const articlesRouter = express.Router();

articlesRouter
	.route('/')
	.get(getArticles);

articlesRouter
	.route('/:article_id')
	.get(getArticleById)
	.patch(patchArticleVoteById);

articlesRouter
	.route('/:article_id/comments')
	.get(getCommentsByArticleId)
	.post(postCommentsByArticleId);

module.exports = articlesRouter;