var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Represents a subject
// name - String, represents name of subject

var subjectSchema = new Schema({
    name:  String
});

module.exports = mongoose.model('Subject', subjectSchema);
