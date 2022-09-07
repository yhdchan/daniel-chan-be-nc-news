exports.handleCustomErrors = (err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
};

exports.handlePSQLErrors = (err, req, res, next) => {};

exports.handle500Errors = (err,req, res, next) => {
	console.log(err);
	res.status(500).send({ msg: 'internal server error!'})
}