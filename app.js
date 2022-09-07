const express = require('express');
const { getArticleById } = require('./controllers/articles.controllers');
const { handleCustomErrors, handlePSQLErrors, handle500Errors } = require('./controllers/errors.controllers');
const { getTopics } = require('./controllers/topics.controllers');

const app = express()

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById);

app.all('*', (req,res,next) => {
	res.status(404).send({ msg: 'not found! api path does not exist!'})
});

app.use(handleCustomErrors);
app.use(handlePSQLErrors);
app.use(handle500Errors);

module.exports = app;