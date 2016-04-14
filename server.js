// Require modules
const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    personAPI = require('./controllers/personController.js'),
    subjectAPI = require('./controllers/subjectController.js'),
    pathAPI = require('./controllers/pathController.js'),
    env = process.env.NODE_ENV || 'dev',
    app = module.exports = express(),
    config = require('./config')[env];

// Server port numer
const PORT = process.env.PORT || config.port || 8000;

// Conect to DB
mongoose.connect(config.db);
// Use body parse, so we can actually get the data
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/app/index.html');
});

app.use('/static', express.static(__dirname + '/app'));

// GET all subjects
/*
    ENDPOINT FORMAT
    Type: "GET",
    Headers: {
    "Content-Type": "application/json"
    },
    Url: "/api/subjects"

    RETURN FORMAT - [{Subject}, {Subject}, ...]
}
*/
app.get('/api/subjects', subjectAPI.getSubjects);

// POST new subject
/*
    ENDPOINT FORMAT
    Type: "POST",
    Headers: {
    "Content-Type": "application/json"
    },
    Url: "/api/subject",
    Body: {
        "name": {name of subject}
    }

    RETURN FORMAT - {Subject}
}
*/
app.post('/api/subject', subjectAPI.postSubject);

// GET all persons
/*
    ENDPOINT FORMAT
    Type: "GET",
    Headers: {
    "Content-Type": "application/json"
    },
    Url: "/api/persons"

    RETURN FORMAT - [{Person}, {Person}, ...]
}
*/
app.get('/api/persons', personAPI.getPersons);

// POST new person
/*
    ENDPOINT FORMAT
    Type: "POST",
    Headers: {
    "Content-Type": "application/json"
    },
    Url: "/api/person",
    Body: {
        "name": {name of person},
        "friends": [{ID's of friends that are also persons}],
        "subjects": [{ID's of subjects}]
    }

    RETURN FORMAT - {Person}
}
*/
app.post('/api/person', personAPI.postPerson);

// POST get shortest path from person to subject
/*
    ENDPOINT FORMAT
    Type: "POST",
    Headers: {
    "Content-Type": "application/json"
    },
    Url: "/api/shortestPath",
    Body: {
        "person": {ID of person to start at},
        "subject": {ID of subject to find}]
    }

    RETURN FORMAT - [{Person}, {Person}, ...]
}
*/
app.post('/api/shortestPath', pathAPI.findShortestPath);


// Server
var server = app.listen(PORT || 8000, function() {
    console.log("Express server dispatched on port %d", server.address().port);
});

module.exports.app = app;
