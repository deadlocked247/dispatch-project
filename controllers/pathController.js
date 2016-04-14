const Subject = require('../models/subject.js'),
      Person = require('../models/person.js');
/*
    shortestPath - Finds the shortest path that contains the subject given
    personID is ID of person to start at
    subjectID is ID of subject to find
    personToFriends is a map of person Ids to their list of friends
    persontoSubjects is a map of person Ids to their list of subjects
*/
function shortestPath(personID, subjectID, personToFriends, persontoSubjects) {
    if (persontoSubjects[personID].indexOf(subjectID) > -1) {
        return [personID];
    }
    var queue = [ personID ];
    var visited = {},
        predecessor = {},
        tail = 0;
    visited[personID] = true;
    while (tail < queue.length) {
        var u = queue[tail++],
            neighbors = personToFriends[u];

        for (var i = 0; i < neighbors.length; ++i) {
            var v = neighbors[i];
            if (visited[v]) {
                continue;
            }
            visited[v] = true;
            if (persontoSubjects[v].indexOf(subjectID) > -1) {   // Check if the path is complete.
                var path = [ v ];   // If so, backtrack through the path.
                while (u && persontoSubjects[u].indexOf(subjectID) === -1) {
                    u ? path.push(u) : null;
                    u = predecessor[u];
                }
                path.reverse();
                return path;
            }
            if (Object.keys(predecessor).indexOf(u) === -1) {
                predecessor[v] = u;
                queue.push(v);
            }
        }
    }
    return false;
}

exports.findShortestPath = (req, res) => {
    if (req.body.person && req.body.subject) {
        var personToFriends = {};
        var persontoSubjects = {};
        Person.find({}, (err, persons) => {
            // Construct the graph
            for (x in persons) {
                personToFriends[persons[x]._id] = persons[x].friends;
                persontoSubjects[persons[x]._id] = persons[x].subjects;
            }
            var path = shortestPath(req.body.person, req.body.subject, personToFriends, persontoSubjects);
            var promises = [];
            for (var x in path) {
                ((id) => {
                    promises.push(new Promise(function(resolve, reject) {
                        Person.findOne({_id:id}, function (err, person) {
                            person ? resolve(person) : reject(err);
                        });
                    }));
                })(path[x]);
            }

            Promise.all(promises)
            .then((payload) => {
                res.send(payload);
            })
            .catch((payload) => {
                res.send(payload);
            });
        });
    } else {
        res.status(422);
        res.send({"message": "Person and Subject fields is required"});
    }
}
