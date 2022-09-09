exports.handleCustomErrors = (err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
};

exports.handle400PSQLErrors = (err, req, res, next) => {
	if (err.code === '22P02') {
		const idCheck = err.where.match(/\$\d+/g)[0];
		if (idCheck === '$1') {
			res.status(400).send({ msg: 'Bad request! Wrong data type for id!'});
		} else if (req.body.inc_votes) {
			if (typeof req.body.inc_votes === 'number') {
				res.status(400).send({ msg: 'Bad request! Increment value is not an integer! The increment value must be a non-zero integer.' });
			} else {
				res.status(400).send({ msg: 'Bad request! Wrong data type! The increment value must be a non-zero integer.' });
			}
		} else {
			res.status(400).send({ msg: 'Bad request! Wrong data type!'});
		}
	} else if (err.code === '23503') {
		const errKey = err.detail.match(/[^(]+(?=[)])/g)[0];
		const errValue = err.detail.match(/[^(]+(?=[)])/g)[1];
		res.status(404).send({ msg: `No such ${errKey}: ${errValue}`});
	} else if (err.code === '42601') {
		res.status(400).send({ msg: `Bad request! Invalid order query!`});
	} else if (err.code === '42703') {
		res.status(400).send({ msg: `Bad request! Wrong data type for id!`});
	} else {
		next(err);
	}
};

exports.handle500Errors = (err,req, res, next) => {
	console.log(err);
	res.status(500).send({ msg: 'internal server error!'})
}