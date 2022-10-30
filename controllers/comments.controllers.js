const {
  removeCommentById,
  updateCommentVoteById,
} = require("../models/comments.models");

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentById(comment_id)
    .then((comment) => {
      res.status(204).send({ comment });
    })
    .catch(next);
};

exports.patchCommentVoteById = (req, res, next) => {
  const { comment_id } = req.params;
  const body = req.body;
  updateCommentVoteById(comment_id, body)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
