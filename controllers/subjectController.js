const Subject = require('../models/subject.js'),
      Person = require('../models/person.js');

exports.getSubjects = (req, res) => {
    Subject.find((err, subjects) => {
        res.send(subjects);
    });
}

exports.postSubject = (req, res) => {
    if(req.body.name) {
        new Subject({name: req.body.name }).save((err, subject) => {
            if (err) res.send(err);
            res.status(200);
            res.send(subject);
        });
    } else {
        res.status(422);
        res.send({"message": "Subject name field is required"});
    }
}
