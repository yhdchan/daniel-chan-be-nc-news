const { selectUsers } = require("../models/users.models");

exports.getUsers = (req, res, next) => {
	selectUsers()
		.then((users) => {
			res.send({ users });
		})
		.catch(next);
}