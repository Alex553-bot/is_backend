const pgp = require('pg-promise')();

const db = pgp('postgres://rravdpke:YfCSxDaLb3IPCeiOFJujfkdZyTzr_ZmF@heffalump.db.elephantsql.com/rravdpke');
module.exports = db;