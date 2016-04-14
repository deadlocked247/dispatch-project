var mongoose = require('mongoose'),
    Subject = require('./subject.js'),
    Schema = mongoose.Schema;

var personSchema = new Schema({
    name:  String,
    subjects: [{type: Schema.Types.ObjectId, ref: 'Subject'}],
    friends: [{type: Schema.Types.ObjectId, ref: 'Person'}]
});

module.exports = mongoose.model('Person', personSchema);
