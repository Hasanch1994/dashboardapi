const { MongoClient } = require("mongodb");
require("dotenv").config();

// Connection URL
const url = process.env.DBURL;
const client = new MongoClient(url);

// Database Name
const dbName = process.env.DBNAME;

const connect = () => client && client.connect();
const db = () => client && client.db(dbName);

module.exports = {
  client,
  db: db(),
};
