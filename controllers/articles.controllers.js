const {
  selectArticleById,
  updateArticleVoteById,
  selectArticles,
  selectCommentsByArticleId,
  createCommentByArticleId,
  createArticle,
  removeArticleById,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleVoteById = (req, res, next) => {
  const { article_id } = req.params;
  const body = req.body;
  updateArticleVoteById(article_id, body)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const query = req.query;
  selectArticles(query)
    .then(({ total_count, articles }) => {
      res.status(200).send({ total_count, articles });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const query = req.query;
  selectCommentsByArticleId(article_id, query)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  createCommentByArticleId(article_id, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  createArticle(newArticle)
    .then(({ article_id }) => {
      return selectArticleById(article_id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  removeArticleById(article_id)
    .then((article) => {
      res.status(204).send({ article });
    })
    .catch(next);
};
