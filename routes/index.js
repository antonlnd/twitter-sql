'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
			 client.query('SELECT * FROM tweets join users on users.id = tweets.user_id', (err,result) => {
			 if (err) return next(err);
			 var tweets = result.rows;
			 res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
			 });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
		client.query('select * from  tweets join users on users.id = tweets.user_id where users.name = $1', [req.params.username], (err,data) => {
		if (err) return next(err);
		var tweets = data.rows;
		res.render('index', {
      title: 'Twitter.js',
      tweets: tweets,
      showForm: true,
      username: req.params.username
    });
	})
	});

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
		client.query('select * from tweets join users on users.id = tweets.user_id where tweets.id = $1', [req.params.id], (err, data)  => {
		var tweets = data.rows;
		res.render('index', {
      title: 'Twitter.js',
      tweets: tweets // an array of only one element ;-)
    });
	});
	});

  // create a new tweet
  router.post('/tweets', function(req, res, next){
		var newTweet = tweetBank.add(req.body.name, req.body.content);
		client.query('SELECT user_id from tweets join users on users.id = tweets.user_id where users.name = $1', [req.body.name], (er,da)  => {
		var theId = da.rows

		client.query('insert into tweets ($3,content)  VALUES (select id from users where name=$1),$2', [req.body.name, req.body.content,theId], (err,data)  => {
		var newTweet = data.rows;
		})
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });
});
  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
