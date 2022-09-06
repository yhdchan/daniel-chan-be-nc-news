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