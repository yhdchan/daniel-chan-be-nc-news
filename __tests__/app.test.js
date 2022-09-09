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
				expect(body.topics).toHaveLength(3);
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
	test('200: should return an article object which should have the properties including author, title, article_id, body, topic, created_at, votes and comment_count that greater than 0',() => {
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
          comment_count: 11,
        })
      })
  })
  test('200: should return an article object which should have the properties including author, title, article_id, body, topic, created_at, votes and comment_count that article_id exists but no comment so far',() => {
    return request(app)
      .get('/api/articles/7')
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 7,
          title: "Z",
          topic: "mitch",
          author: "icellusedkars",
          body: "I was hungry.",
          created_at: "2020-01-07T14:08:00.000Z",
          votes: 0,
          comment_count: 0,
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
				expect(body.users).toHaveLength(4);
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
		test('400: should return an error message when the number of votes is less than 0 after decrement', () => {
			const voteUpdate = { inc_votes: -10000 };
			return request(app)
			.patch('/api/articles/1')
			.send(voteUpdate)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request! The current number of votes of this article is 100. Number of votes cannot be less than 0 after decrement.');
			})
		})
	})
})

describe('GET /api/articles', () => {
	describe('Successful responses', () => {
		test('200: should return an articles array of article objects which should have the properties including author, title, article_id, body, topic, created_at, votes and comment_count', () => {
			return request(app)
				.get('/api/articles')
				.expect(200)
				.then(({ body }) => {
					expect(body.articles).toBeInstanceOf(Array);
					expect(body.articles).toHaveLength(12);
					body.articles.forEach((article) => {
						expect(article).toMatchObject({
							article_id: expect.any(Number),
							title: expect.any(String),
							topic: expect.any(String),
							author: expect.any(String),
							created_at: expect.any(String),
							votes: expect.any(Number),
							comment_count: expect.any(Number),
						})
					})
				})
		})
		test('200: should return articles are sorted by date in descending order by default', () => {
			return request(app)
				.get("/api/articles")
				.expect(200)
					.then(({ body }) => {
						expect(body.articles).toBeSortedBy("created_at", { descending: true });
					});
		})
		test('200: should return articles are sorted any valid column (defaults to date) in descending order by default', () => {
			return request(app)
				.get("/api/articles?sort_by=title")
				.expect(200)
					.then(({ body }) => {
						expect(body.articles).toBeSortedBy("title", { descending: true });
					});
		})
		test('200: should return articles are sorted by date by default but in ascending order (defaults to descending)', () => {
			return request(app)
			.get("/api/articles?order=asc")
			.expect(200)
			.then(({ body }) => {
				expect(body.articles).toBeSortedBy("created_at");
			});
		})
		test('200: should return articles are sorted by any valid column (defaults to date) or/and order, which can be set to asc or desc for ascending or descending (defaults to descending)', () => {
			return request(app)
				.get("/api/articles?sort_by=article_id&order=asc")
				.expect(200)
					.then(({ body }) => {
						expect(body.articles).toBeSortedBy("article_id", {
							coerce: true,
						});
					});
		})
		test('200: articles are filtered by the topic value specified in the query', () => {
			return request(app)
				.get('/api/articles?topic=cats')
				.expect(200)
				.then(({ body }) => {
					expect(body.articles).toBeInstanceOf(Array);
					expect(body.articles).toHaveLength(1);
					expect(body.articles).toEqual([
						{
							article_id: 5,
							title: "UNCOVERED: catspiracy to bring down democracy",
							topic: "cats",
							author: "rogersop",
							created_at: "2020-08-03T13:14:00.000Z",
							votes: 0,
							comment_count: 2,
						}
					])
				})
		})
		test('200: should return an empty array when topic is valid but no instances in articles table', () => {
			return request(app)
				.get('/api/articles?topic=paper')
				.expect(200)
				.then(({ body }) => {
					expect(body.articles).toEqual([]);
				})
		})
	})
	describe('Error Handling', () => {
		test("400: for a sort_by that is not an exisiting column", () => {
      return request(app)
        .get("/api/articles?sort_by=not_a_column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! 'not_a_column' is not an existing column");
        });
    });
		test("400: for a sort_by that is not an exisiting column with others valid queries", () => {
      return request(app)
        .get("/api/articles?topic=cats&sort_by=not_a_column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! 'not_a_column' is not an existing column");
        });
    });
		test("400: for a order that is an invalid order", () => {
      return request(app)
        .get("/api/articles?order=not_an_order")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! Invalid order query!");
        });
    });
		test("400: for a order that is an invalid order with other valid queries", () => {
      return request(app)
        .get("/api/articles?topic=cats&sort_by=article_id&order=not_an_order")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! Invalid order query!");
        });
    });
		test('400: should return an error message when passed an invalid query', () => {
			return request(app)
			.get('/api/articles?animal=cats')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request! Invalid query. Only accept the queries for topic, sort_by and/or order');
			})
		})
		test('400: should return an error message when passed more than one invalid queries', () => {
			return request(app)
			.get('/api/articles?animal=cats&fruit=banana')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request! Invalid query. Only accept the queries for topic, sort_by and/or order');
			})
		})
		test('400: should return an error message when passed an invalid queries with others valid queries', () => {
			return request(app)
			.get('/api/articles?animal=cats&sort_by=article_id&order=asc')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request! Invalid query. Only accept the queries for topic, sort_by and/or order');
			})
		})
		test('400: should return an error message that when passed an invalid queries with others valid queries but invalid values', () => {
			return request(app)
			.get('/api/articles?animal=cats&sort_by=not_a_column&order=not_an_order')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request! Invalid query. Only accept the queries for topic, sort_by and/or order');
			})
		})
		test('400: should return an error message that when passed a valid filter query with others valid queries but invalid values', () => {
			return request(app)
			.get('/api/articles?topic=cats&sort_by=not_a_column&order=not_an_order')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad request! \'not_a_column\' is not an existing column');
			})
		})
		test('404: should return an error message when passed a query that topic does not exist in topics table', () => {
			return request(app)
			.get('/api/articles?topic=not-a-topic')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('No such topic: not-a-topic');
			})
		})
		test('404: should return an error message when passed a query that topic does not exist in topics table with others valid queries', () => {
			return request(app)
			.get('/api/articles?sort_by=article_id&order=asc&topic=not-a-topic')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('No such topic: not-a-topic');
			})
		})
	})
})

describe('GET /api/articles/:article_id/comments', () => {
	describe('Successful responses', () => {
		test('200: should return an array of comments for the given article_id that have comments in comments table', () => {
			return request(app)
				.get('/api/articles/5/comments')
				.expect(200)
				.then(({ body }) => {
					expect(body.comments).toBeInstanceOf(Array);
					expect(body.comments).toHaveLength(2);
					expect(body.comments).toEqual([
						{
							comment_id: 14,
							votes: 16,
							created_at: '2020-06-09T05:00:00.000Z',
							author: 'icellusedkars',
							body: 'What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.'
						},
						{
							comment_id: 15,
							votes: 1,
							created_at: '2020-11-24T00:08:00.000Z',
							author: 'butter_bridge',
							body: "I am 100% sure that we're not completely sure."
						}
					])
				})
		})
		test('200: should return an empty array for the given article_id that no comments in comments table', () => {
			return request(app)
				.get('/api/articles/2/comments')
				.expect(200)
				.then(({ body }) => {
					expect(body.comments).toEqual([]);
				})
		})
	})
	describe('Error Handling', () => {
		test('404: should return an error message when passed an article id that does not exist', () => {
			return request(app)
				.get('/api/articles/1000/comments')
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('No such article_id: 1000');
				})
		})
	})
})

describe('POST /api/articles/:article_id/comments', () => {
	describe('Successful responses', () => {
		test('201: should return the posted comment', () => {
			const testNewComment = {
				username: 'lurker',
				body: 'I hate streaming mouth most',
			};
			return request(app)
				.post('/api/articles/1/comments')
				.send(testNewComment)
				.expect(201)
				.then(({ body }) => {
					expect(body.comment).toMatchObject({
						comment_id: 19,
						body: 'I hate streaming mouth most',
   					votes: 0,
    				author: 'lurker',
    				article_id: 1,
						created_at: expect.any(String),
					});
				})
		})
	})
	describe('Error Handling', () => {
		test('400: should return an error message when passed an incomplete object', () => {
			const testNewComment = {
				username: 'lurker',
			};
			return request(app)
				.post('/api/articles/1/comments')
				.send(testNewComment)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request! Request body only accepts an object with the properties of username and body, while username is registered and body shall not be an empty string.')
				})
		})
		test('400: should return an error message when passed an object that with extra key', () => {
			const testNewComment = {
				username: 'lurker',
				body: 'I hate streaming mouth most',
				rating: 6,
			};
			return request(app)
				.post('/api/articles/1/comments')
				.send(testNewComment)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request! Request body only accepts an object with the properties of username and body, while username is registered and body shall not be an empty string.')
				})
		})
		test('400: should return an error message when passed an object that with wrong key', () => {
			const testNewComment = {
				name: 'lurker',
				body: 'I hate streaming mouth most',
			};
			return request(app)
				.post('/api/articles/1/comments')
				.send(testNewComment)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Bad request! Request body only accepts an object with the properties of username and body, while username is registered and body shall not be an empty string.')
				})
		})
		test('404: should return an error message when passed an article id that does not exist', () => {
			const testNewComment = {
				username: 'lurker',
				body: 'I hate streaming mouth most',
			};
			return request(app)
				.post('/api/articles/1000/comments')
				.send(testNewComment)
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('No such article_id: 1000');
				})
		})
		test('404: should return an error message when passed a username that does not exist in users table', () => {
			const testNewComment = {
				username: 'not-a-username',
				body: 'I hate streaming mouth most',
			};
			return request(app)
				.post('/api/articles/1/comments')
				.send(testNewComment)
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('No such author: not-a-username');
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