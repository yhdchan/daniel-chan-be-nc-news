const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count
      FROM articles 
      LEFT JOIN comments
      ON articles.article_id=comments.article_id
      WHERE articles.article_id=$1
      GROUP BY articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes;
    `,
      [article_id]
    )
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: `No such article_id: ${article_id}`,
        });
      } else {
        return rows[0];
      }
    });
};

exports.updateArticleVoteById = (article_id, body) => {
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
				UPDATE articles
				SET
				votes = votes + $2
				WHERE article_id = $1
				RETURNING *;
			`,
        [article_id, inc_votes]
      )
      .then(({ rows, rowCount }) => {
        if (rowCount === 0) {
          return Promise.reject({
            status: 404,
            msg: `No such article_id: ${article_id}`,
          });
        } else if (rows[0].votes < 0) {
          return Promise.reject({
            status: 400,
            msg: `Bad request! The current number of votes of this article is ${
              rows[0].votes - inc_votes
            }. Number of votes cannot be less than 0 after decrement.`,
          });
        } else {
          return rows[0];
        }
      });
  }
};

exports.selectArticles = (query) => {
  const {
    author,
    topic,
    sort_by = "created_at",
    order = "DESC",
    limit = 10,
    p = 1,
  } = query;

  const validQueriesCheck = (arr) => {
    for (const element of arr) {
      if (
        element !== "author" &&
        element !== "topic" &&
        element !== "order" &&
        element !== "sort_by" &&
        element !== "limit" &&
        element !== "p"
      ) {
        return false;
      }
    }
    return true;
  };

  if (!validQueriesCheck(Object.keys(query))) {
    return Promise.reject({
      status: 400,
      msg: "Bad request! Invalid query. Only accept the queries for topic, sort_by, order, limit and/or p",
    });
  }

  const validColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];

  if (!validColumns.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: `Bad request! \'${sort_by}\' is not an existing column`,
    });
  }
  let queryStr = `
		SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count
		FROM articles 
		LEFT JOIN comments
		ON articles.article_id=comments.article_id
	`;
  const queryValues = [];

  if (topic || author) {
    if (topic && author) {
      queryStr += `WHERE topic = $1 AND articles.author =$2`;
      queryValues.push(topic, author);
    } else if (topic) {
      queryStr += `WHERE topic = $1`;
      queryValues.push(topic);
    } else {
      queryStr += `WHERE articles.author = $1`;
      queryValues.push(author);
    }
  }

  queryStr += `
		GROUP BY articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes
	`;

  if (sort_by === "comment_count") {
    queryStr += `
			ORDER BY COUNT(comments.article_id) ${order}
  	`;
  } else {
    queryStr += `
			ORDER BY articles.${sort_by} ${order}
		`;
  }

  if (
    !Number.isInteger(+limit) ||
    limit <= 0 ||
    !Number.isInteger(+p) ||
    p <= 0
  ) {
    if (
      (!Number.isInteger(+limit) || limit <= 0) &&
      (!Number.isInteger(+p) || p <= 0)
    ) {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Invalid 'limit' and 'p' query. Only accept a positive integer",
      });
    } else if (!Number.isInteger(+limit) || limit <= 0) {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Invalid 'limit' query. Only accept a positive integer",
      });
    } else {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Invalid 'p' query. Only accept a positive integer",
      });
    }
  }

  return db
    .query(queryStr, queryValues)
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        if (topic || author) {
          if (topic && author) {
            return Promise.all([
              rows,
              db.query(`SELECT * FROM topics WHERE slug=$1`, [queryValues[0]]),
              db.query(`SELECT * FROM users WHERE username=$1`, [
                queryValues[1],
              ]),
            ]);
          } else if (topic) {
            return Promise.all([
              rows,
              db.query(`SELECT * FROM topics WHERE slug=$1`, queryValues),
            ]);
          } else {
            return Promise.all([
              rows,
              db.query(`SELECT * FROM users WHERE username=$1`, queryValues),
            ]);
          }
        }
      } else {
        return Promise.all([rows]);
      }
    })
    .then(([rows, result1, result2]) => {
      if (result1 !== undefined || result2 !== undefined) {
        if (topic && author) {
          if (result1.rowCount > 0 && result2.rowCount > 0) {
            if (p > 1) {
              return Promise.reject({
                status: 404,
                msg: "Not Found",
              });
            }
            return { total_count: rows.length, articles: rows };
          } else if (result1.rowCount === 0 && result2.rowCount > 0) {
            return Promise.reject({
              status: 404,
              msg: `No such topic: ${queryValues[0]}`,
            });
          } else if (result1.rowCount > 0 && result2.rowCount === 0) {
            return Promise.reject({
              status: 404,
              msg: `No such author: ${queryValues[1]}`,
            });
          } else {
            return Promise.reject({
              status: 404,
              msg: `No such topic: ${queryValues[0]} and no such author: ${queryValues[1]}`,
            });
          }
        } else {
          if (result1.rowCount > 0) {
            if (p > 1) {
              return Promise.reject({
                status: 404,
                msg: "Not Found",
              });
            }
            return { total_count: rows.length, articles: rows };
          } else {
            const key = Object.keys(query).find(
              (key) => query[key] === queryValues[0]
            );
            return Promise.reject({
              status: 404,
              msg: `No such ${key}: ${queryValues[0]}`,
            });
          }
        }
      } else {
        const total_count = rows.length;
        const articles = rows.slice((p - 1) * limit, p * limit);
        if (limit * (p - 1) >= total_count) {
          return Promise.reject({
            status: 404,
            msg: "Not Found",
          });
        }
        return { total_count, articles };
      }
    });
};

exports.selectCommentsByArticleId = (article_id, query) => {
  const { limit = 10, p = 1 } = query;

  if (!Number.isInteger(+article_id) || article_id <= 0) {
    return Promise.reject({
      status: 400,
      msg: "Bad request! Wrong data type for id!",
    });
  }

  const validQueriesCheck = (arr) => {
    for (const element of arr) {
      if (element !== "limit" && element !== "p") {
        return false;
      }
    }
    return true;
  };

  if (!validQueriesCheck(Object.keys(query))) {
    return Promise.reject({
      status: 400,
      msg: "Bad request! Invalid query. Only accept the queries for limit and/or p",
    });
  }

  if (
    !Number.isInteger(+limit) ||
    limit <= 0 ||
    !Number.isInteger(+p) ||
    p <= 0
  ) {
    if (
      (!Number.isInteger(+limit) || limit <= 0) &&
      (!Number.isInteger(+p) || p <= 0)
    ) {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Invalid 'limit' and 'p' query. Only accept a positive integer",
      });
    } else if (!Number.isInteger(+limit) || limit <= 0) {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Invalid 'limit' query. Only accept a positive integer",
      });
    } else {
      return Promise.reject({
        status: 400,
        msg: "Bad request! Invalid 'p' query. Only accept a positive integer",
      });
    }
  }

  return db
    .query(
      `
			SELECT comment_id, votes, created_at, author, body
			FROM comments
			WHERE article_id=${article_id};
		`
    )
    .then(({ rows: commentsRows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.all([
          commentsRows,
          db.query(`SELECT * FROM articles WHERE article_id=${article_id}`),
        ]);
      } else {
        return Promise.all([commentsRows]);
      }
    })
    .then(([commentsRows, articlesResult]) => {
      if (articlesResult !== undefined) {
        if (articlesResult.rowCount > 0) {
          if (p > 1) {
            return Promise.reject({
              status: 404,
              msg: "Not Found",
            });
          }
          return commentsRows;
        } else {
          return Promise.reject({
            status: 404,
            msg: `No such article_id: ${article_id}`,
          });
        }
      } else {
        const total_count = commentsRows.length;
        const comments = commentsRows.slice((p - 1) * limit, p * limit);
        if (limit * (p - 1) >= total_count) {
          return Promise.reject({
            status: 404,
            msg: "Not Found",
          });
        }
        return comments;
      }
    });
};

exports.createCommentByArticleId = (article_id, newComment) => {
  const { username, body } = newComment;

  if (!username || !body || Object.keys(newComment).length !== 2) {
    return Promise.reject({
      status: 400,
      msg: "Bad request! Request body only accepts an object with the properties of username and body, while username is registered and body shall not be an empty string.",
    });
  }

  return db
    .query(
      "INSERT INTO comments (body, author, article_id) VALUES ($2, $3, $1) RETURNING *;",
      [article_id, body, username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.createArticle = (newArticle) => {
  const { author, title, body, topic } = newArticle;

  if (
    !author ||
    !title ||
    !body ||
    !topic ||
    Object.keys(newArticle).length !== 4
  ) {
    return Promise.reject({
      status: 400,
      msg: "Bad request! Request body only accepts an object with the properties of author, title, body and topic, while author must be registered, topic does exist and title and body shall not be an empty string.",
    });
  }

  return db
    .query(
      "INSERT INTO articles (author, title, body, topic) VALUES ($1, $2, $3, $4) RETURNING article_id;",
      [author, title, body, topic]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeArticleById = (article_id) => {
  return db
    .query(
      `
			DELETE FROM comments 
			WHERE article_id=$1 
			RETURNING *;
		`,
      [article_id]
    )
    .then(() => {
      return db.query(
        `
				DELETE FROM articles 
				WHERE article_id=$1 
				RETURNING *;
			`,
        [article_id]
      );
    })
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: `No such article_id: ${article_id}`,
        });
      } else {
        return rows;
      }
    });
};
