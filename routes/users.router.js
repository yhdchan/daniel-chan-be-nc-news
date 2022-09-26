const express = require("express");
const { getUsers } = require("../controllers/users.controllers");

const usersRouter = express.Router();

usersRouter
	.route('/')
	.get(getUsers);

module.exports = usersRouter;