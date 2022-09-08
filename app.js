const express = require('express');
const { 
	getArticleById, 
	patchArticleVoteById, 
	getArticles 
} = require('./controllers/articles.controllers');
const { 
	handleCustomErrors, 
	handle400PSQLErrors, 
	handle500Errors 
} = require('./controllers/errors.controllers');
const { getTopics } = require('./controllers/topics.controllers');
const { getUsers } = require('./controllers/users.controllers');

const app = express()

app.use(express.json())

app.get('/api/articles/:article_id', getArticleById);
app.patch('/api/articles/:article_id', patchArticleVoteById)
app.get('/api/articles', getArticles);


app.get('/api/topics', getTopics);

app.get('/api/users', getUsers);


app.all('*', (req,res,next) => {
	res.status(404).send({ msg: 'not found! api path does not exist!'})
});

app.use(handleCustomErrors);
app.use(handle400PSQLErrors);
app.use(handle500Errors);

module.exports = app;