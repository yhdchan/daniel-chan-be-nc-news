const express = require('express');
const { getEndpoints } = require('../controllers/endpoints.controllers');
const articlesRouter = require('./articles.router');
const commentsRouter = require('./comments.router');
const topicsRouter = require('./topics.router');
const usersRouter = require('./users.router');

const apiRouter = express.Router();

apiRouter.get('/', getEndpoints);

apiRouter.use('/articles', articlesRouter);

apiRouter.use('/comments', commentsRouter);

apiRouter.use('/topics', topicsRouter);

apiRouter.use('/users', usersRouter);

module.exports = apiRouter;