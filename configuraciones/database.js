const pgp = require('pg-promise')();
require('dotenv').config();

const db = pgp(process.env.URL_BD);
module.exports = db;