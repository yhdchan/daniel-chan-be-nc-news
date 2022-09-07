const db = require('../db/connection');

exports.selectTopics = () => {
	return db
		.query(`SELECT * FROM topics`)
		.then(({ rows }) => {
			return rows;
		})
}

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