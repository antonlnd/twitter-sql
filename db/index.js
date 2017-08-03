const pg = require('pg');
var pgURL = 'postgres://localhost/twitterdb'
var client = new pg.Client(pgURL);

client.connect();

module.exports = client;

