const { 
	selectArticleById, 
	updateArticleVoteById, 
	selectArticles 
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;
	selectArticleById(article_id)
		.then((article) => {
			res.status(200).send({ article })
		})
		.catch(next);
}

exports.patchArticleVoteById = (req, res, next) => {
	const { article_id } = req.params;
	const body = req.body;
	updateArticleVoteById(article_id, body)
		.then((article) => {
			res.status(200).send({ article })
		})
		.catch(next);
}

exports.getArticles = (req, res, next) => {
	const query = req.query;
	selectArticles(query)
		.then((articles) => {
			res.status(200).send({ articles })
		})
		.catch(next);
}