# NC News

## Creating the connection to the separate `test` and `development` databases

We'll have two databases in this project. One for real looking dev data and another for simpler test data.

Your first task is to create your connection to the database using `node-postgres`.

You will need to create a connection to the relevant database in a `./db/connection.js` file, and use `dotenv` files (`.env.test` & `.env.development`) to determine which database to connect to, based on whether you are running your `jest` tests, or running the server manually.

You will need to create two .env files for your project: .env.test and .env.development. Into each, add PGDATABASE=<database_name_here>, with the correct database name for that environment (see /db/setup.sql for the database names). Double check that these .env files are .gitignored.