const { selectTopics, selectArticleById } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
	selectTopics()
		.then((topics) => {
			res.send({ topics });
		})
		.catch(next);
}

exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;
	selectArticleById(article_id)
		.then((article) => {
			res.send({ article })
		})
		.catch(next);
}