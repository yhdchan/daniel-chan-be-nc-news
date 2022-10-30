const db = require("../db/connection");

exports.removeCommentById = (comment_id) => {
  return db
    .query(
      `
			DELETE FROM comments 
			WHERE comment_id=$1 
			RETURNING *;
		`,
      [comment_id]
    )
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: `No such comment_id: ${comment_id}`,
        });
      } else {
        return rows;
      }
    });
};

exports.updateCommentVoteById = (comment_id, body) => {
  const { inc_votes } = body;
  if (inc_votes === undefined) {
    if (Object.keys(body).length === 0) {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Incomplete request body! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer.",
      });
    } else {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Invalid key! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer.",
      });
    }
  } else if (inc_votes === 0) {
    return Promise.reject({
      status: 400,
      msg: "Bad request! Votes remains unchanged! The increment value must be a non-zero integer.",
    });
  } else {
    return db
      .query(
        `
				UPDATE comments
				SET
				votes = votes + $2
				WHERE comment_id = $1
				RETURNING *;
			`,
        [comment_id, inc_votes]
      )
      .then(({ rows, rowCount }) => {
        if (rowCount === 0) {
          return Promise.reject({
            status: 404,
            msg: `No such comment_id: ${comment_id}`,
          });
        } else if (rows[0].votes < 0) {
          return Promise.reject({
            status: 400,
            msg: `Bad request! The current number of votes of this comment is ${
              rows[0].votes - inc_votes
            }. Number of votes cannot be less than 0 after decrement.`,
          });
        } else {
          return rows[0];
        }
      });
  }
};
