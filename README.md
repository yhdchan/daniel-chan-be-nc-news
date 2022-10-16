# NC News

## Hosting a PSQL DB using Heroku

Link to hosted version: https://yhdc-ncnews.herokuapp.com/api

## Summary

A news API is built for the purpose of accessing application data programmatically to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

You can view all the available endpoints with corresponding acceptable queries of the api via the above link. Error handling tests are added for each piece of functionality on the endpoints.

## Built With

- PostgreSQL
- node-postgres
- Express.js
- jest
- supertest

## Getting Started

### Clone the repo:

```sh
git clone https://github.com/yhdchan/daniel-chan-be-nc-news
```

### Install NPM packages:

```sh
npm install
```

### Seed local database:

```sh
npm run setup-dbs
npm run seed
```

\*\* Remember that you'll need create the connection (described as below) before you seed local database

### Run tests:

```sh
npm test
```

## Creating the connection to the separate `test` and `development` databases

We'll have two databases in this project. One for real looking dev data and another for simpler test data.

Your first task is to create your connection to the database using `node-postgres`.

You will need to create a connection to the relevant database in a `./db/connection.js` file, and use `dotenv` files (`.env.test` & `.env.development`) to determine which database to connect to, based on whether you are running your `jest` tests, or running the server manually.

You will need to create two .env files for your project: .env.test and .env.development. Into each, add PGDATABASE=<database_name_here>, with the correct database name for that environment (see /db/setup.sql for the database names). Double check that these .env files are .gitignored.

#### Minimum version of Node.js:>=15.0.0

#### Minimum version of Postgres: 15
