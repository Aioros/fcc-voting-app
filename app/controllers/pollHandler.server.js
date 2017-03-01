'use strict';

var Users = require('../models/users.js');
var Poll = require('../models/polls.js');

function PollHandler () {
	
	this.getAllPolls = function(req, res) {
		Poll.find().exec(function(err, result) {
			if (err) {
				res.send(err);
			}
			res.json(result);
		});
	};

	this.getPolls = function (req, res) {
		Poll
			.find({ '_author': req.user._id }, { '_id': false })
			.exec(function (err, result) {
				if (err) {
					res.send(err);
				}
				res.json(result);
			});
	};

	this.addPoll = function (req, res) {
		var pollData = req.body;
		pollData._author = req.user._id;
		var newPoll = new Poll(pollData);
		newPoll.save(function (err) {
			if (err) {
				res.send(err);
			} else
			res.json(pollData);
		});
	};

	this.deletePoll = function (req, res) {
		Poll.remove({ '_id': req.params.pollid, '_author': req.user._id }, function(err, poll) {
			if (err) {
				res.send(err);
			}
			res.json(poll);
		});
	};
	
	this.addVote = function (req, res) {
		var optionId = req.body.id;
		Poll.findOne({_id: req.params.pollid})
			.then(function(poll) {
				var alreadyVoted = false;
				var userId = "";
				if (req.user)
					userId = req.user._id;
				else
					userId = req.headers['x-forwarded-for'];
				for (var o = 0; o < poll.options.length; o++) {
					//if (poll.options[o].votes.indexOf(userId) >= 0)
					if (poll.options[o].votes
							.filter(el => el === userId || el === req.headers['x-forwarded-for'])
							.length > 0)
						alreadyVoted = true;
				}
				if (!alreadyVoted) {
					if (optionId) {
						poll.options.find(opt => opt._id == optionId).votes.push(userId);
					} else {
						poll.options.push({
							text: req.body.text,
							votes: [userId]
						});
					}
					poll.save(function (err) {
						if (err) {
							res.send(err);
						} else
						res.json({status: 1, poll: poll});
					});
				} else {
					res.json({status: 0});
				}
			});
	};

}

module.exports = PollHandler;
