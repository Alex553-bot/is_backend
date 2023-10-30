const pgp = require('pg-promise')();

const db = pgp(':D');
module.exports = db;