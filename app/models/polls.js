'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    _author: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    options: [{
        text: String,
        votes: [String]
    }]
});

module.exports = mongoose.model('Poll', Poll);
