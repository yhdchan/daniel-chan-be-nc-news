const express = require('express');
const { getTopics } = require('./controllers/topics.controllers');

const app = express()

app.get('/api/topics', getTopics);

app.all('*', (req,res,next) => {
	res.status(404).send({ msg: 'not found! api path does not exist!'})
})

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "internal server error!" });
});

module.exports = app;