const Subject = require('../models/subject.js'),
      Person = require('../models/person.js');

exports.getPersons = (req, res) => {
    Person.find()
    .populate('subjects')
    .populate('friends')
    .exec((err, persons) => {
        if(err) res.send(err);
        res.send(persons);
    })
}

exports.postPerson = (req, res) => {
    if(req.body.name) {
        new Person(req.body).save((err, person) => {
            if(err) res.send(err);
            if(person) {
                person.save((err) => {
                    if (err) res.send(err);
                    person.populate('subjects')
                    .populate('friends', (err, person) => {
                        if (err) res.send(err);
                        var promises = [];
                        for(var x in person.friends) {
                            ((friend, id) => {
                                promises.push(new Promise((resolve, reject) => {
                                    var arr = friend.friends;
                                    arr.push(id);
                                    Person.findOneAndUpdate({_id: friend._id}, { friends: arr }, { new: true }, (err, person) => {
                                        person ? resolve(person) : reject({"message" : "Could not find friend " + friend.name});
                                    });
                                }))
                            })(person.friends[x], person._id);
                        }
                        Promise.all(promises)
                        .then((payload) => {
                            res.send(person);
                        })
                        .catch((payload) => {
                            res.send(payload);
                        });
                    });
                });
            } else {
                res.status(404);
                res.send();
            }

        });
    }
    else {
        res.status(422);
        res.send({"message": "Person name field is required"});
    }
}
