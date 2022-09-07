const db = require('../db/connection');

exports.selectArticleById = (article_id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id=$1`,[article_id])
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
					return Promise.reject({ status: 404, msg: `No such article_id: ${article_id}`})
				} else {
					return rows[0];
				}
			})
	}
};