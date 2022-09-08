const db = require('../db/connection');

exports.selectArticleById = (article_id) => {
  return db
    .query(`
      SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count
      FROM articles 
      LEFT JOIN comments
      ON articles.article_id=comments.article_id
      WHERE articles.article_id=$1
      GROUP BY articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes;
    `,[article_id])
    .then(({ rows, rowCount }) => {
      if (rowCount === 0 ) {
        return Promise.reject({ status: 404, msg: `No such article_id: ${article_id}`})
      } else {
        return rows[0];
      }
    })
}

exports.updateArticleVoteById = (article_id, body) => {
	const {inc_votes} = body;
	if (inc_votes === undefined) {
		if (Object.keys(body).length === 0) {
			return  Promise.reject({ status: 400, msg: 'Bad request! Incomplete request body! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer.'});
		} else {
			return  Promise.reject({ status: 400, msg: 'Bad request! Invalid key! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer.'});
		}
	} else if (inc_votes === 0) {
		return Promise.reject({ status: 400, msg: 'Bad request! Votes remains unchanged! The increment value must be a non-zero integer.'});
	} else {
		return db
			.query(`
				UPDATE articles
				SET
				votes = votes + $2
				WHERE article_id = $1
				RETURNING *;
			`, [article_id, inc_votes])
			.then(({ rows, rowCount }) => {
				if (rowCount === 0 ) {
					return Promise.reject({ status: 404, msg: `No such article_id: ${article_id}`});
				} else if (rows[0].votes < 0) {
					return Promise.reject({ status: 400, msg: `Bad request! The current number of votes of this article is ${rows[0].votes-inc_votes}. Number of votes cannot be less than 0 after decrement.`}); 
				} else {	
					return rows[0];
				}
			})
	}
};