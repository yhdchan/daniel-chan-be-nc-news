const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const app = require("../app");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("200: should return an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toBeInstanceOf(Array);
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: should return an article object which should have the properties including author, title, article_id, body, topic, created_at, votes and comment_count that greater than 0", () => {
    return request(app)
      .get("/api/articles/1")
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
        });
      });
  });
  test("200: should return an article object which should have the properties including author, title, article_id, body, topic, created_at, votes and comment_count that article_id exists but no comment so far", () => {
    return request(app)
      .get("/api/articles/7")
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
        });
      });
  });
  test("404: should return an error message when passed an article id that does not exist", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No such article_id: 1000");
      });
  });
  test("400: should return an error message when passed an article id that is not a positive integer", () => {
    return request(app)
      .get("/api/articles/abc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request! Wrong data type for id!");
      });
  });
});

describe("GET /api/users", () => {
  test("200: should return an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toBeInstanceOf(Array);
        expect(body.users).toHaveLength(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  describe("Successful responses", () => {
    test("200: should return the updated article object with the updated article's vote property when passed a request for increment", () => {
      const voteUpdate = { inc_votes: 1 };
      const UpdatedArticle = {
        article_id: 3,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: "2020-11-03T09:12:00.000Z",
        votes: 1,
      };
      return request(app)
        .patch("/api/articles/3")
        .send(voteUpdate)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual(UpdatedArticle);
        });
    });
    test("200: should return the updated article object with the updated article's vote property when passed a request for decrement", () => {
      const voteUpdate = { inc_votes: -100 };
      const UpdatedArticle = {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: 0,
      };
      return request(app)
        .patch("/api/articles/1")
        .send(voteUpdate)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual(UpdatedArticle);
        });
    });
  });
  describe("Error Handling", () => {
    test("404: should return an error message when passed an article id that does not exist", () => {
      const voteUpdate = { inc_votes: 1 };
      return request(app)
        .patch("/api/articles/1000")
        .send(voteUpdate)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such article_id: 1000");
        });
    });
    test("400: should return an error message when passed an article id that is not a positive integer", () => {
      const voteUpdate = { inc_votes: 1 };
      return request(app)
        .patch("/api/articles/abc")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! Wrong data type for id!");
        });
    });
    test("400: should return an error message when passed an object that value is equal to 0", () => {
      const voteUpdate = { inc_votes: 0 };
      return request(app)
        .patch("/api/articles/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Votes remains unchanged! The increment value must be a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an object that value is not an integer", () => {
      const voteUpdate = { inc_votes: 1.234 };
      return request(app)
        .patch("/api/articles/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Increment value is not an integer! The increment value must be a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an object that value with wrong data type", () => {
      const voteUpdate = { inc_votes: "not a number" };
      return request(app)
        .patch("/api/articles/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Wrong data type! The increment value must be a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an incomplete object", () => {
      const voteUpdate = {};
      return request(app)
        .patch("/api/articles/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Incomplete request body! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an object that key is invalid", () => {
      const voteUpdate = { body: "new text" };
      return request(app)
        .patch("/api/articles/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid key! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer."
          );
        });
    });
    test("400: should return an error message when the number of votes is less than 0 after decrement", () => {
      const voteUpdate = { inc_votes: -10000 };
      return request(app)
        .patch("/api/articles/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! The current number of votes of this article is 100. Number of votes cannot be less than 0 after decrement."
          );
        });
    });
  });
});

describe("GET /api/articles", () => {
  describe("Successful responses", () => {
    test("200: should return an articles array of the first 10 article objects by default which should have the properties including author, title, article_id, body, topic, created_at, votes and comment_count", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(12);
          expect(body.articles).toBeInstanceOf(Array);
          expect(body.articles).toHaveLength(10);
          body.articles.forEach((article) => {
            expect(article).toMatchObject({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            });
          });
        });
    });
    test("200: should return articles are sorted by date in descending order by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("200: should return an articles array of the next 10 article objects if any", () => {
      return request(app)
        .get("/api/articles?p=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(12);
          expect(body.articles).toEqual([
            {
              article_id: 11,
              author: "icellusedkars",
              comment_count: 0,
              created_at: "2020-01-15T22:21:00.000Z",
              title: "Am I a cat?",
              topic: "mitch",
              votes: 0,
            },
            {
              article_id: 7,
              author: "icellusedkars",
              comment_count: 0,
              created_at: "2020-01-07T14:08:00.000Z",
              title: "Z",
              topic: "mitch",
              votes: 0,
            },
          ]);
        });
    });
    test("200: should return an articles array of the first 15 article objects if any", () => {
      return request(app)
        .get("/api/articles?limit=15")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(12);
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
            });
          });
        });
    });
    test("200: should return an articles array of the second 6 article objects if any", () => {
      return request(app)
        .get("/api/articles?limit=6&p=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(12);
          expect(body.articles).toEqual([
            {
              article_id: 9,
              author: "butter_bridge",
              comment_count: 2,
              created_at: "2020-06-06T09:10:00.000Z",
              title: "They're not exactly dogs, are they?",
              topic: "mitch",
              votes: 0,
            },
            {
              article_id: 10,
              author: "rogersop",
              comment_count: 0,
              created_at: "2020-05-14T04:15:00.000Z",
              title: "Seven inspirational thought leaders from Manchester UK",
              topic: "mitch",
              votes: 0,
            },
            {
              article_id: 4,
              author: "rogersop",
              comment_count: 0,
              created_at: "2020-05-06T01:14:00.000Z",
              title: "Student SUES Mitch!",
              topic: "mitch",
              votes: 0,
            },
            {
              article_id: 8,
              author: "icellusedkars",
              comment_count: 0,
              created_at: "2020-04-17T01:08:00.000Z",
              title: "Does Mitch predate civilisation?",
              topic: "mitch",
              votes: 0,
            },
            {
              article_id: 11,
              author: "icellusedkars",
              comment_count: 0,
              created_at: "2020-01-15T22:21:00.000Z",
              title: "Am I a cat?",
              topic: "mitch",
              votes: 0,
            },
            {
              article_id: 7,
              author: "icellusedkars",
              comment_count: 0,
              created_at: "2020-01-07T14:08:00.000Z",
              title: "Z",
              topic: "mitch",
              votes: 0,
            },
          ]);
        });
    });
    test("200: should return articles are sorted any valid column (defaults to date) in descending order by default", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("title", { descending: true });
        });
    });
    test("200: should return articles are sorted by date by default but in ascending order (defaults to descending)", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at");
        });
    });
    test("200: should return articles are sorted by any valid column (defaults to date) or/and order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("comment_count", {
            coerce: true,
          });
        });
    });
    test("200: articles are filtered by the topic value specified in the query", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(1);
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
            },
          ]);
        });
    });
    test("200: should return articles are filtered by the topic value specified in the query and sorted by any valid column (defaults to date) or/and order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
      return request(app)
        .get("/api/articles?topic=mitch&sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(11);
          expect(body.articles).toBeInstanceOf(Array);
          expect(body.articles).toHaveLength(10);
          expect(body.articles).toEqual([
            {
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-07-09T20:11:00.000Z",
              votes: 100,
              comment_count: 11,
            },
            {
              article_id: 2,
              title: "Sony Vaio; or, The Laptop",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-10-16T05:03:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 3,
              title: "Eight pug gifs that remind me of mitch",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-11-03T09:12:00.000Z",
              votes: 0,
              comment_count: 2,
            },
            {
              article_id: 4,
              title: "Student SUES Mitch!",
              topic: "mitch",
              author: "rogersop",
              created_at: "2020-05-06T01:14:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 6,
              title: "A",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-10-18T01:00:00.000Z",
              votes: 0,
              comment_count: 1,
            },
            {
              article_id: 7,
              title: "Z",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-01-07T14:08:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 8,
              title: "Does Mitch predate civilisation?",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-04-17T01:08:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 9,
              title: "They're not exactly dogs, are they?",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-06-06T09:10:00.000Z",
              votes: 0,
              comment_count: 2,
            },
            {
              article_id: 10,
              title: "Seven inspirational thought leaders from Manchester UK",
              topic: "mitch",
              author: "rogersop",
              created_at: "2020-05-14T04:15:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 11,
              title: "Am I a cat?",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-01-15T22:21:00.000Z",
              votes: 0,
              comment_count: 0,
            },
          ]);
        });
    });
    test("200: should return an empty array when topic is valid but no instances in articles table", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(0);
          expect(body.articles).toEqual([]);
        });
    });
    test("200: should return articles are filtered by the author value specified in the query", () => {
      return request(app)
        .get("/api/articles?author=icellusedkars")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(6);
          expect(body.articles).toBeInstanceOf(Array);
          expect(body.articles).toHaveLength(6);
          expect(body.articles).toEqual([
            {
              article_id: 3,
              title: "Eight pug gifs that remind me of mitch",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-11-03T09:12:00.000Z",
              votes: 0,
              comment_count: 2,
            },
            {
              article_id: 6,
              title: "A",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-10-18T01:00:00.000Z",
              votes: 0,
              comment_count: 1,
            },
            {
              article_id: 2,
              title: "Sony Vaio; or, The Laptop",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-10-16T05:03:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 8,
              title: "Does Mitch predate civilisation?",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-04-17T01:08:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 11,
              title: "Am I a cat?",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-01-15T22:21:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 7,
              title: "Z",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-01-07T14:08:00.000Z",
              votes: 0,
              comment_count: 0,
            },
          ]);
        });
    });
    test("200: should return articles are filtered by the author value specified in the query and sorted by any valid column (defaults to date) or/and order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
      return request(app)
        .get("/api/articles?author=icellusedkars&sort_by=article_id")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(6);
          expect(body.articles).toBeInstanceOf(Array);
          expect(body.articles).toHaveLength(6);
          expect(body.articles).toEqual([
            {
              article_id: 11,
              title: "Am I a cat?",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-01-15T22:21:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 8,
              title: "Does Mitch predate civilisation?",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-04-17T01:08:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 7,
              title: "Z",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-01-07T14:08:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 6,
              title: "A",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-10-18T01:00:00.000Z",
              votes: 0,
              comment_count: 1,
            },
            {
              article_id: 3,
              title: "Eight pug gifs that remind me of mitch",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-11-03T09:12:00.000Z",
              votes: 0,
              comment_count: 2,
            },
            {
              article_id: 2,
              title: "Sony Vaio; or, The Laptop",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-10-16T05:03:00.000Z",
              votes: 0,
              comment_count: 0,
            },
          ]);
        });
    });
    test("200: should return articles are filtered by the topic and author value specified in the query", () => {
      return request(app)
        .get("/api/articles?topic=mitch&author=butter_bridge")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(3);
          expect(body.articles).toBeInstanceOf(Array);
          expect(body.articles).toHaveLength(3);
          expect(body.articles).toEqual([
            {
              article_id: 12,
              title: "Moustache",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-10-11T11:24:00.000Z",
              votes: 0,
              comment_count: 0,
            },
            {
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-07-09T20:11:00.000Z",
              votes: 100,
              comment_count: 11,
            },
            {
              article_id: 9,
              title: "They're not exactly dogs, are they?",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-06-06T09:10:00.000Z",
              votes: 0,
              comment_count: 2,
            },
          ]);
        });
    });
    test("200: should return articles are filtered by the topic and author value specified in the query and sorted by any valid column (defaults to date) or/and order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
      return request(app)
        .get(
          "/api/articles?topic=mitch&author=butter_bridge&sort_by=article_id&order=asc"
        )
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(3);
          expect(body.articles).toBeInstanceOf(Array);
          expect(body.articles).toHaveLength(3);
          expect(body.articles).toEqual([
            {
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-07-09T20:11:00.000Z",
              votes: 100,
              comment_count: 11,
            },
            {
              article_id: 9,
              title: "They're not exactly dogs, are they?",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-06-06T09:10:00.000Z",
              votes: 0,
              comment_count: 2,
            },
            {
              article_id: 12,
              title: "Moustache",
              topic: "mitch",
              author: "butter_bridge",
              created_at: "2020-10-11T11:24:00.000Z",
              votes: 0,
              comment_count: 0,
            },
          ]);
        });
    });
    test("200: should return an empty array when author does exist in users table but no instances in articles table", () => {
      return request(app)
        .get("/api/articles?author=lurker")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(0);
          expect(body.articles).toEqual([]);
        });
    });
    test("200: should return an empty array when topic and author do exist in topics table and users table respectively but no instances in articles table", () => {
      return request(app)
        .get("/api/articles?topic=mitch&author=lurker")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(0);
          expect(body.articles).toEqual([]);
        });
    });
  });
  test("200: should return an articles array of required article objects when passed all valid queries", () => {
    return request(app)
      .get(
        "/api/articles?topic=mitch&author=icellusedkars&sort_by=article_id&order=asc&limit=5&p=2"
      )
      .expect(200)
      .then(({ body }) => {
        expect(body.total_count).toBe(6);
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles).toHaveLength(1);
        expect(body.articles).toEqual([
          {
            article_id: 11,
            title: "Am I a cat?",
            topic: "mitch",
            author: "icellusedkars",
            created_at: "2020-01-15T22:21:00.000Z",
            votes: 0,
            comment_count: 0,
          },
        ]);
      });
  });
  describe("Error Handling", () => {
    test("400: for a sort_by that is not an exisiting column", () => {
      return request(app)
        .get("/api/articles?sort_by=not_a_column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! 'not_a_column' is not an existing column"
          );
        });
    });
    test("400: for a sort_by that is not an exisiting column with others valid queries", () => {
      return request(app)
        .get("/api/articles?topic=cats&sort_by=not_a_column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! 'not_a_column' is not an existing column"
          );
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
    test("400: should return an error message when passed an invalid query", () => {
      return request(app)
        .get("/api/articles?animal=cats")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid query. Only accept the queries for topic, sort_by, order, limit and/or p"
          );
        });
    });
    test("400: should return an error message when passed more than one invalid queries", () => {
      return request(app)
        .get("/api/articles?animal=cats&fruit=banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid query. Only accept the queries for topic, sort_by, order, limit and/or p"
          );
        });
    });
    test("400: should return an error message when passed an invalid queries with others valid queries", () => {
      return request(app)
        .get("/api/articles?animal=cats&sort_by=article_id&order=asc")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid query. Only accept the queries for topic, sort_by, order, limit and/or p"
          );
        });
    });
    test("400: should return an error message that when passed an invalid queries with others valid queries but invalid values", () => {
      return request(app)
        .get(
          "/api/articles?animal=cats&sort_by=not_a_column&order=not_an_order"
        )
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid query. Only accept the queries for topic, sort_by, order, limit and/or p"
          );
        });
    });
    test("400: should return an error message that when passed a valid filter query with others valid queries but invalid values", () => {
      return request(app)
        .get("/api/articles?topic=cats&sort_by=not_a_column&order=not_an_order")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! 'not_a_column' is not an existing column"
          );
        });
    });
    test("400: should return an error message that when passed a non-positive integer for the query of limit", () => {
      return request(app)
        .get("/api/articles?limit=not_a_limit")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid 'limit' query. Only accept a positive integer"
          );
        });
    });
    test("400: should return an error message that when passed a non-positive integer for the query of p", () => {
      return request(app)
        .get("/api/articles?limit=5&p=-2")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid 'p' query. Only accept a positive integer"
          );
        });
    });
    test("400: should return an error message that when passed a non-positive integer for the query of limit and p", () => {
      return request(app)
        .get("/api/articles?limit=5.5&p=not_a_p")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid 'limit' and 'p' query. Only accept a positive integer"
          );
        });
    });
    test("404: should return an error message when passed a query that topic does not exist in topics table", () => {
      return request(app)
        .get("/api/articles?topic=not-a-topic")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such topic: not-a-topic");
        });
    });
    test("404: should return an error message when passed a query that topic does not exist in topics table with others valid queries", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc&topic=not-a-topic")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such topic: not-a-topic");
        });
    });
    test("404: should return an error message when passed a query that author does not exist in users table", () => {
      return request(app)
        .get("/api/articles?author=not-an-author")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such author: not-an-author");
        });
    });
    test("404: should return an error message when passed a query that author does not exist in users table with others valid queries", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc&author=not-an-author")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such author: not-an-author");
        });
    });
    test("404: should return an error message when passed queries that author does not exist in users table but topic does exist in topics table", () => {
      return request(app)
        .get("/api/articles?topic=mitch&author=not-an-author")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such author: not-an-author");
        });
    });
    test("404: should return an error message when passed queries that author does not exist in users table but topic does exist in topics table with others valid queries", () => {
      return request(app)
        .get(
          "/api/articles?sort_by=article_id&order=asc&topic=mitch&author=not-an-author"
        )
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such author: not-an-author");
        });
    });
    test("404: should return an error message when passed queries that author does exist in users table but topic does not exist in topics table", () => {
      return request(app)
        .get("/api/articles?topic=not-a-topic&author=butter_bridge")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such topic: not-a-topic");
        });
    });
    test("404: should return an error message when passed queries that author does exist in users table but topic does not exist in topics table with others valid queries", () => {
      return request(app)
        .get(
          "/api/articles?sort_by=article_id&order=asc&topic=not-a-topic&author=butter_bridge"
        )
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such topic: not-a-topic");
        });
    });
    test("404: should return an error message when passed queries that both topic and author does exist in topics and users table respectively", () => {
      return request(app)
        .get("/api/articles?topic=not-a-topic&author=not-an-author")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "No such topic: not-a-topic and no such author: not-an-author"
          );
        });
    });
    test("404: should return an error message when passed queries that both topic and author does exist in topics and users table respectively with others valid queries", () => {
      return request(app)
        .get(
          "/api/articles?sort_by=article_id&order=asc&topic=not-a-topic&author=not-an-author"
        )
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "No such topic: not-a-topic and no such author: not-an-author"
          );
        });
    });
    test("404: should return an error message when passed the p query that the page number does not exist", () => {
      return request(app)
        .get("/api/articles?limit=6&p=3")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("404: should return an error message when passed the p query that the page number does not exist with others valid queries", () => {
      return request(app)
        .get(
          "/api/articles?topic=mitch&author=lurker&sort_by=article_id&order=asc&limit=5&p=2"
        )
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  describe("Successful responses", () => {
    test("200: should return an array of comments for the given article_id that have comments in comments table", () => {
      return request(app)
        .get("/api/articles/5/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toBeInstanceOf(Array);
          expect(body.comments).toHaveLength(2);
          expect(body.comments).toEqual([
            {
              comment_id: 14,
              votes: 16,
              created_at: "2020-06-09T05:00:00.000Z",
              author: "icellusedkars",
              body: "What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.",
            },
            {
              comment_id: 15,
              votes: 1,
              created_at: "2020-11-24T00:08:00.000Z",
              author: "butter_bridge",
              body: "I am 100% sure that we're not completely sure.",
            },
          ]);
        });
    });
    test("200: should return an empty array for the given article_id that no comments in comments table", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    test("200: should return an array of comments for the given article_id that have comments in comments table with the valid limit query", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([
            {
              author: "butter_bridge",
              body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
              comment_id: 2,
              created_at: "2020-10-31T03:03:00.000Z",
              votes: 14,
            },
            {
              author: "icellusedkars",
              body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
              comment_id: 3,
              created_at: "2020-03-01T01:13:00.000Z",
              votes: 100,
            },
            {
              author: "icellusedkars",
              body: " I carry a log — yes. Is it funny to you? It is not to me.",
              comment_id: 4,
              created_at: "2020-02-23T12:01:00.000Z",
              votes: -100,
            },
            {
              author: "icellusedkars",
              body: "I hate streaming noses",
              comment_id: 5,
              created_at: "2020-11-03T21:00:00.000Z",
              votes: 0,
            },
            {
              author: "icellusedkars",
              body: "I hate streaming eyes even more",
              comment_id: 6,
              created_at: "2020-04-11T21:02:00.000Z",
              votes: 0,
            },
          ]);
        });
    });
    test("200: should return an array of comments for the given article_id that have comments in comments table with the valid p query", () => {
      return request(app)
        .get("/api/articles/1/comments?p=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([
            {
              author: "butter_bridge",
              body: "This morning, I showered for nine minutes.",
              comment_id: 18,
              created_at: "2020-07-21T00:20:00.000Z",
              votes: 16,
            },
          ]);
        });
    });
    test("200: should return an array of comments for the given article_id that have comments in comments table with the valid limit and p queries", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=6&p=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([
            {
              author: "icellusedkars",
              body: "Delicious crackerbreads",
              comment_id: 8,
              created_at: "2020-04-14T20:19:00.000Z",
              votes: 0,
            },
            {
              author: "icellusedkars",
              body: "Superficially charming",
              comment_id: 9,
              created_at: "2020-01-01T03:08:00.000Z",
              votes: 0,
            },
            {
              author: "icellusedkars",
              body: "Massive intercranial brain haemorrhage",
              comment_id: 12,
              created_at: "2020-03-02T07:10:00.000Z",
              votes: 0,
            },
            {
              author: "icellusedkars",
              body: "Fruit pastilles",
              comment_id: 13,
              created_at: "2020-06-15T10:25:00.000Z",
              votes: 0,
            },
            {
              author: "butter_bridge",
              body: "This morning, I showered for nine minutes.",
              comment_id: 18,
              created_at: "2020-07-21T00:20:00.000Z",
              votes: 16,
            },
          ]);
        });
    });
  });
  describe("Error Handling", () => {
    test("400: should return an error message when passed an article id that is not a positive integer", () => {
      return request(app)
        .get("/api/articles/abc/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! Wrong data type for id!");
        });
    });
    test("404: should return an error message when passed an article id that does not exist", () => {
      return request(app)
        .get("/api/articles/1000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such article_id: 1000");
        });
    });
    test("400: should return an error message when passed an invalid query", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=6&query=not_a_query")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid query. Only accept the queries for limit and/or p"
          );
        });
    });
    test("400: should return an error message that when passed a non-positive integer for the query of limit", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=not_a_limit")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid 'limit' query. Only accept a positive integer"
          );
        });
    });
    test("400: should return an error message that when passed a non-positive integer for the query of p", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5&p=-2")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid 'p' query. Only accept a positive integer"
          );
        });
    });
    test("400: should return an error message that when passed a non-positive integer for the query of limit and p", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5.5&p=not_a_p")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid 'limit' and 'p' query. Only accept a positive integer"
          );
        });
    });
    test("404: should return an error message when passed the p query that the page number does not exist", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=6&p=3")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("404: should return an error message when passed the p query that the page number does not exist (for the article with no comments)", () => {
      return request(app)
        .get("/api/articles/2/comments?p=2")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  describe("Successful responses", () => {
    test("201: should return the posted comment", () => {
      const testNewComment = {
        username: "lurker",
        body: "I hate streaming mouth most",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testNewComment)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: 19,
            body: "I hate streaming mouth most",
            votes: 0,
            author: "lurker",
            article_id: 1,
            created_at: expect.any(String),
          });
        });
    });
  });
  describe("Error Handling", () => {
    test("400: should return an error message when passed an incomplete object", () => {
      const testNewComment = {
        username: "lurker",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testNewComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of username and body, while username is registered and body shall not be an empty string."
          );
        });
    });
    test("400: should return an error message when passed an object that with extra key", () => {
      const testNewComment = {
        username: "lurker",
        body: "I hate streaming mouth most",
        rating: 6,
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testNewComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of username and body, while username is registered and body shall not be an empty string."
          );
        });
    });
    test("400: should return an error message when passed an object that with wrong key", () => {
      const testNewComment = {
        name: "lurker",
        body: "I hate streaming mouth most",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testNewComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of username and body, while username is registered and body shall not be an empty string."
          );
        });
    });
    test("404: should return an error message when passed an article id that does not exist", () => {
      const testNewComment = {
        username: "lurker",
        body: "I hate streaming mouth most",
      };
      return request(app)
        .post("/api/articles/1000/comments")
        .send(testNewComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such article_id: 1000");
        });
    });
    test("400: should return an error message when passed an article id that is not a positive integer", () => {
      const testNewComment = {
        username: "lurker",
        body: "I hate streaming mouth most",
      };
      return request(app)
        .post("/api/articles/abc/comments")
        .send(testNewComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! Wrong data type for id!");
        });
    });
    test("404: should return an error message when passed a username that does not exist in users table", () => {
      const testNewComment = {
        username: "not-a-username",
        body: "I hate streaming mouth most",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testNewComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such author: not-a-username");
        });
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: should return no content", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("404: should return an error message when passed an comment id that does not exist", () => {
    return request(app)
      .delete("/api/comments/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No such comment_id: 1000");
      });
  });
  test("400: should return an error message when passed an comment id that not an integer", () => {
    return request(app)
      .delete("/api/comments/abc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request! Wrong data type for id!");
      });
  });
});

describe("Error Handling", () => {
  test("404: should return an error message when passed an api path that does not exist", () => {
    return request(app)
      .get("/api/not-a-path")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found! api path does not exist!");
      });
  });
});

describe("GET /api", () => {
  test("200: should return endpoints.json", () => {
    return request(app)
      .get("/api")
      .expect("Content-Type", /json/)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body.endpoints)).toHaveLength(14);
        expect(Object.keys(body.endpoints)).toEqual([
          "GET /api",
          "GET /api/articles",
          "POST /api/articles",
          "GET /api/articles/:article_id",
          "PATCH /api/articles/:article_id",
          "DELETE /api/articles/:article_id",
          "GET /api/articles/:article_id/comments",
          "POST /api/articles/:article_id/comments",
          "PATCH /api/comments/:comment_id",
          "DELETE /api/comments/:comment_id",
          "GET /api/topics",
          "POST /api/topics",
          "GET /api/users",
          "GET /api/users/:username",
        ]);
      });
  });
});

describe("GET /api/users/:username", () => {
  describe("Successful responses", () => {
    test("200: should return an user object which should have the properties including username, avatar_url, name", () => {
      return request(app)
        .get("/api/users/icellusedkars")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toEqual({
            username: "icellusedkars",
            name: "sam",
            avatar_url:
              "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
          });
        });
    });
  });
  describe("Error Handling", () => {
    test("404: should return an error message when passed a username that does not exist", () => {
      return request(app)
        .get("/api/users/not-a-username")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such username: not-a-username");
        });
    });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  describe("Successful responses", () => {
    test("200: should return the updated comment object with the updated comment's vote property when passed a request for increment", () => {
      const voteUpdate = { inc_votes: 1 };
      const UpdatedComment = {
        comment_id: 5,
        body: "I hate streaming noses",
        votes: 1,
        author: "icellusedkars",
        article_id: 1,
        created_at: "2020-11-03T21:00:00.000Z",
      };
      return request(app)
        .patch("/api/comments/5")
        .send(voteUpdate)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment).toEqual(UpdatedComment);
        });
    });
    test("200: should return the updated comment object with the updated comment's vote property when passed a request for decrement", () => {
      const voteUpdate = { inc_votes: -1 };
      const UpdatedComment = {
        comment_id: 2,
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 13,
        author: "butter_bridge",
        article_id: 1,
        created_at: "2020-10-31T03:03:00.000Z",
      };
      return request(app)
        .patch("/api/comments/2")
        .send(voteUpdate)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment).toEqual(UpdatedComment);
        });
    });
  });
  describe("Error Handling", () => {
    test("404: should return an error message when passed a comment id that does not exist", () => {
      const voteUpdate = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/1000")
        .send(voteUpdate)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such comment_id: 1000");
        });
    });
    test("400: should return an error message when passed a comment id that is not a positive integer", () => {
      const voteUpdate = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/abc")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request! Wrong data type for id!");
        });
    });
    test("400: should return an error message when passed an object that value is equal to 0", () => {
      const voteUpdate = { inc_votes: 0 };
      return request(app)
        .patch("/api/comments/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Votes remains unchanged! The increment value must be a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an object that value is not an integer", () => {
      const voteUpdate = { inc_votes: 1.234 };
      return request(app)
        .patch("/api/comments/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Increment value is not an integer! The increment value must be a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an object that value with wrong data type", () => {
      const voteUpdate = { inc_votes: "not a number" };
      return request(app)
        .patch("/api/comments/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Wrong data type! The increment value must be a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an incomplete object", () => {
      const voteUpdate = {};
      return request(app)
        .patch("/api/comments/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Incomplete request body! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer."
          );
        });
    });
    test("400: should return an error message when passed an object that key is invalid", () => {
      const voteUpdate = { body: "new text" };
      return request(app)
        .patch("/api/comments/1")
        .send(voteUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Invalid key! Accept only if request body is an object in the form { inc_votes: newVote }, where newVote is a non-zero integer."
          );
        });
    });
  });
});

describe("POST /api/articles", () => {
  describe("Successful responses", () => {
    test("201: should return the newly added article", () => {
      const testNewArticle = {
        author: "lurker",
        title: "Testing title",
        body: "Testing Text",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(testNewArticle)
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: 13,
            author: "lurker",
            title: "Testing title",
            body: "Testing Text",
            topic: "cats",
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });
  });
  describe("Error Handling", () => {
    test("400: should return an error message when passed an incomplete object", () => {
      const testNewArticle = {
        author: "lurker",
      };
      return request(app)
        .post("/api/articles")
        .send(testNewArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of author, title, body and topic, while author must be registered, topic does exist and title and body shall not be an empty string."
          );
        });
    });
    test("400: should return an error message when passed an object that with extra key", () => {
      const testNewArticle = {
        author: "lurker",
        title: "Testing title",
        body: "Testing Text",
        topic: "cats",
        key: "extra key",
      };
      return request(app)
        .post("/api/articles")
        .send(testNewArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of author, title, body and topic, while author must be registered, topic does exist and title and body shall not be an empty string."
          );
        });
    });
    test("400: should return an error message when passed an object that with wrong key", () => {
      const testNewArticle = {
        username: "lurker",
        title: "Testing title",
        body: "Testing Text",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(testNewArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of author, title, body and topic, while author must be registered, topic does exist and title and body shall not be an empty string."
          );
        });
    });
    test("404: should return an error message when passed a username that does not exist in users table", () => {
      const testNewArticle = {
        author: "not-a-username",
        title: "Testing title",
        body: "Testing Text",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(testNewArticle)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such author: not-a-username");
        });
    });
    test("404: should return an error message when passed a topic that does not exist in topics table", () => {
      const testNewArticle = {
        author: "lurker",
        title: "Testing title",
        body: "Testing Text",
        topic: "not-a-topic",
      };
      return request(app)
        .post("/api/articles")
        .send(testNewArticle)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No such topic: not-a-topic");
        });
    });
  });
});

describe("POST /api/topics", () => {
  describe("Successful responses", () => {
    test("201: should return the newly added topic", () => {
      const testNewTopic = {
        slug: "topic name here",
        description: "description here",
      };
      return request(app)
        .post("/api/topics")
        .send(testNewTopic)
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).toMatchObject({
            slug: "topic name here",
            description: "description here",
          });
        });
    });
  });
  describe("Error Handling", () => {
    test("400: should return an error message when passed an incomplete object", () => {
      const testNewTopic = {
        slug: "topic name here",
      };
      return request(app)
        .post("/api/topics")
        .send(testNewTopic)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of slug and description, while slug and description shall not be empty."
          );
        });
    });
    test("400: should return an error message when passed an empty string", () => {
      const testNewTopic = {
        slug: "",
        description: "description here",
      };
      return request(app)
        .post("/api/topics")
        .send(testNewTopic)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of slug and description, while slug and description shall not be empty."
          );
        });
    });
    test("400: should return an error message when passed an object that with extra key", () => {
      const testNewTopic = {
        slug: "topic name here",
        description: "description here",
        key: "extra key",
      };
      return request(app)
        .post("/api/topics")
        .send(testNewTopic)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of slug and description, while slug and description shall not be empty."
          );
        });
    });
    test("400: should return an error message when passed an object that with wrong key", () => {
      const testNewTopic = {
        topic: "topic name here",
        description: "description here",
      };
      return request(app)
        .post("/api/topics")
        .send(testNewTopic)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Bad request! Request body only accepts an object with the properties of slug and description, while slug and description shall not be empty."
          );
        });
    });
    test("400: should return an error message when added topic that already exists", () => {
      const testNewTopic = {
        slug: "cats",
        description: "description here",
      };
      return request(app)
        .post("/api/topics")
        .send(testNewTopic)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Key (slug)=(cats) already exists.");
        });
    });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("204: should return no content", () => {
    return request(app).delete("/api/articles/3").expect(204);
  });
  test("404: should return an error message when passed an article id that does not exist", () => {
    return request(app)
      .delete("/api/articles/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No such article_id: 1000");
      });
  });
  test("400: should return an error message when passed an article id that not a positive integer", () => {
    return request(app)
      .delete("/api/articles/abc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request! Wrong data type for id!");
      });
  });
});
