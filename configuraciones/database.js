const pgp = require('pg-promise')();

const db = pgp(':v');
module.exports = db;