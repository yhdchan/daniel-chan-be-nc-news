const express = require('express');

const { 
	handleCustomErrors, 
	handle400PSQLErrors, 
	handle500Errors 
} = require('./controllers/errors.controllers');
const apiRouter = require('./routes/api.router');

const app = express()

app.use(express.json())

app.use('/api', apiRouter);

app.all('*', (req, res, next) => {
	res.status(404).send({ msg: 'not found! api path does not exist!'})
});

app.use(handleCustomErrors);
app.use(handle400PSQLErrors);
app.use(handle500Errors);

module.exports = app;