const db = require('../db/connection');

exports.removeCommentById = (comment_id) => {
	return db
		.query(`
			DELETE FROM comments 
			WHERE comment_id=$1 
			RETURNING *;
		`, [comment_id])
		.then(({ rows, rowCount }) => {
			if (rowCount === 0) {
				return Promise.reject({status: 404, msg: `No such comment_id: ${comment_id}`})
			} else {
				return rows;
			}
		})
}