const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.createTopic = (newTopic) => {
  const { slug, description } = newTopic;

  if (!slug || !description || Object.keys(newTopic).length !== 2) {
    return Promise.reject({
      status: 400,
      msg: "Bad request! Request body only accepts an object with the properties of slug and description, while slug and description shall not be empty.",
    });
  }

  return db
    .query(
      "INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;",
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
