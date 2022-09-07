const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const app = require('../app');

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe('GET /api/topics', () => {
	test('200: should return an array of topic objects', () => {
		return request(app)
			.get('/api/topics')
			.expect(200)
			.then(({ body }) => {
				expect(body.topics).toBeInstanceOf(Array);
				expect(body.topics).not.toHaveLength(0);
				body.topics.forEach((topic) => {
					expect(topic).toMatchObject({
						slug: expect.any(String),
						description: expect.any(String),
					})
				})
			})
	})
})

describe('GET /api/articles/:article_id', () => {
	test('200: should return an article object which should have the properties including author, title, article_id, body, topic, created_at and votes',() => {
		return request(app)
			.get('/api/articles/1')
			.expect(200)
			.then(({ body }) => {
				expect(body.article).toEqual({
					article_id: 1,
					title: "Living in the shadow of a great man",
    			topic: "mitch",
   				author: "butter_bridge",
    			body: "I find this existence challenging",
    			created_at: "2020-07-09T20:11:00.000Z",
   				votes: 100,
				})
			})
	})
	test('404: should return an error message when passed an article id that does not exist', () => {
		return request(app)
			.get('/api/articles/1000')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('No such article_id: 1000');
			})
	})
})

describe('GET /api/users', () => {
	test('200: should return an array of user objects', () => {
		return request(app)
			.get('/api/users')
			.expect(200)
			.then(({ body }) => {
				expect(body.users).toBeInstanceOf(Array);
				expect(body.users).not.toHaveLength(0);
				body.users.forEach((user) => {
					expect(user).toMatchObject({
						username: expect.any(String),
						name: expect.any(String),
						avatar_url: expect.any(String),
					})
				})
			})
	})
})

describe('PATCH /api/articles/:article_id', () => {
	describe('Successful responses', () => {
		test('200: should return the updated article object with the updated article\'s vote property when passed a request for increment', () => {
			const voteUpdate = { inc_votes: 1 };
			const UpdatedArticle = {
				article_id: 3,
				title: "Eight pug gifs that remind me of mitch",
				topic: "mitch",
				author: "icellusedkars",
				body: "some gifs",
				created_at: "2020-11-03T09:12:00.000Z",
				votes: 1,
			}
			return request(app)
				.patch('/api/articles/3')
				.send(voteUpdate)
				.expect(200)
				.then(({ body }) => {
					expect(body.article).toEqual(UpdatedArticle);
				})
		})
		test('200: should return the updated article object with the updated article\'s vote property when passed a request for decrement', () => {
			const voteUpdate = { inc_votes: -100 };
			const UpdatedArticle = {
				article_id: 1,
				title: "Living in the shadow of a great man",
				topic: "mitch",
				 author: "butter_bridge",
				body: "I find this existence challenging",
				created_at: "2020-07-09T20:11:00.000Z",
				votes: 0,
			}
			return request(app)
				.patch('/api/articles/1')
				.send(voteUpdate)
				.expect(200)
				.then(({ body }) => {
					expect(body.article).toEqual(UpdatedArticle);
				})
		})
	})
	describe('Error Handling', () => {
		test('404: should return an error message when passed an article id that does not exist', () => {
			const voteUpdate = { inc_votes: 1 };
			return request(app)
				.patch('/api/articles/1000')
				.send(voteUpdate)
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('No such article_id: 1000');
				})
		})
		test('400: should return an error message when passed an object that value is equal to 0', () => {
			const voteUpdate = { inc_votes: 0 };
			return request(app)
				.patch('/api/articles/1')
				.send(voteUpdate)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request! Votes remains unchanged! The increment value must be a non-zero integer.');
				})
		})
		test('400: should return an error message when passed an object that value is not an integer', () => {
			const voteUpdate = { inc_votes: 1.234 };
			return request(app)
				.patch('/api/articles/1')
				.send(voteUpdate)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request! Increment value is not an integer! The increment value must be a non-zero integer.');
				})
		})
		test('400: should return an error message when passed an object that value with wrong data type', () => {
			const voteUpdate = { inc_votes: 'not a number' };
			return request(app)
				.patch('/api/articles/1')
				.send(voteUpdate)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request! Wrong data type! The increment value must be a non-zero integer.');
				})
		})
		test('400: should return an error message when passed an incomplete object', () => {
			const voteUpdate = {};
			return request(app)
				.patch('/api/articles/1')
				.send(voteUpdate)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request! Incomplete request body! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer.');
				})
		})
		test('400: should return an error message when passed an object that key is invalid', () => {
			const voteUpdate = { body: 'new text'};
			return request(app)
			.patch('/api/articles/1')
			.send(voteUpdate)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request! Invalid key! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer.');
			})
		})
	})
})

describe('Error Handling', () => {
	test('404: should return an error message when passed an api path that does not exist', () => {
		return request(app)
			.get('/api/not-a-path')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found! api path does not exist!')
			})
	})
})