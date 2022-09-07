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