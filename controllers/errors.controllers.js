exports.handleCustomErrors = (err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
};

exports.handle400PSQLErrors = (err, req, res, next) => {
	if (err.code === '22P02') {
		if (typeof req.body.inc_votes === 'number') {
			res.status(400).send({ msg: 'Bad request! Increment value is not an integer! The increment value must be a non-zero integer.' });
		} else {
			res.status(400).send({ msg: 'Bad request! Wrong data type! The increment value must be a non-zero integer.' });
		}
	} else {
		next(err);
	}
};

exports.handle500Errors = (err,req, res, next) => {
	console.log(err);
	res.status(500).send({ msg: 'internal server error!'})
}