'use strict';

var path = process.cwd();
var Poll = require(path + '/app/models/polls.js');
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}

	var pollHandler = new PollHandler();

	app.route('/')
		.get(function (req, res) {
			Poll.find().then(function(polls) {
				res.render('index', {user: req.user, polls: polls});
			});
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('back');
		});

	app.route('/mypolls')
		.get(isLoggedIn, function (req, res) {
			Poll.find({ '_author': req.user._id }).then(function(polls) {
				res.render('mypolls', {user: req.user, polls: polls});
			});
		});
		
	app.route('/polls/:pollid')
		.get(function (req, res) {
			Poll.findOne({_id: req.params.pollid}).then(function(poll) {
				res.render('poll', {user: req.user, poll: poll});
			});
		});
		
	app.route('/create')
		.get(isLoggedIn, function(req, res) {
			res.render('create', {user: req.user});
		});

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/public/afterauth.html',
			failureRedirect: '/public/afterauth.html'
		}));
	
	app.route('/api/me')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.twitter);
		});
		
	app.route('/api/polls/:pollid')
		.post(pollHandler.addVote);
	
	app.route('/api/user/polls')
		.get(isLoggedIn, pollHandler.getPolls)
		.post(isLoggedIn, pollHandler.addPoll);
		
	app.route('/api/user/polls/:pollid')
		//.get(isLoggedIn, pollHandler.getPoll)
		.delete(isLoggedIn, pollHandler.deletePoll);
		
	app.route('/api/polls')
		.get(pollHandler.getAllPolls);
	
};
