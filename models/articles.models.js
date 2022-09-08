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

exports.selectArticles = (query) => {
	const { topic } = query;
	
	if (!Object.keys(query).includes('topic') && Object.keys(query).length > 0) {
		return Promise.reject({ status: 400, msg: 'Bad request! Invalid query. Only accept a query for topic' });
	}

	let queryStr = `
		SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count
		FROM articles 
		LEFT JOIN comments
		ON articles.article_id=comments.article_id
	`;
	const queryValues = [];

  if (topic) {
    queryStr += `WHERE topic = $1`;
    queryValues.push(topic);
  }

  queryStr += `
		GROUP BY articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes
		ORDER BY articles.created_at DESC;
  `;

	return db
		.query(queryStr, queryValues)
		.then(({rows: articleRows, rowCount}) => {
			if (rowCount === 0) {
				return Promise.all([
					articleRows,
					db.query(`SELECT * FROM topics WHERE slug=$1`, queryValues)
				])
			} else {
				return Promise.all([articleRows]);
			}
		})
		.then(([articleRows, topicsResult]) => {
			if (topicsResult !== undefined) {
				if (topicsResult.rowCount > 0 ) {
					return articleRows;
				} else {
					return Promise.reject({ status: 404, msg: `No such topic: ${topic}`});
				}	
			}	else {
				return articleRows;
			}
		})
};

exports.selectCommentsByArticleId = (article_id) => {
	return db
		.query(`
			SELECT comment_id, votes, created_at, author, body
			FROM comments
			WHERE article_id=${article_id};
		`)
		.then(({ rows: commentsRows, rowCount }) => {
			if (rowCount === 0) {
				return Promise.all([
					commentsRows,
					db.query(`SELECT * FROM articles WHERE article_id=${article_id}`)
				])
			} else {
				return Promise.all([commentsRows]);
			}
		})
		.then(([commentsRows, articlesResult]) => {
			if (articlesResult !== undefined) {
				if (articlesResult.rowCount > 0 ) {
					return commentsRows;
				} else {
					return Promise.reject({ status: 404, msg: `No such article_id: ${article_id}`})
				}	
			}	else {
				return commentsRows;
			}
		})
}