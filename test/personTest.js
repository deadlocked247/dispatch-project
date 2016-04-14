'use strict';

const env = 'test',
    config = require('../config.js')[env],
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect,
    mongoose = require('mongoose'),
    server = require('../server.js'),
    Subject = require('../models/subject.js'),
    Person = require('../models/person.js');

chai.use(chaiHttp);

/* Clear DB before each test */
beforeEach((done) => {
    function clearDB() {
        for (var i in mongoose.connection.collections) {
            mongoose.connection.collections[i].remove(() => {});
        }
        return done();
    }

    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.db, (err) => {
            if (err) throw err;
            return clearDB();
        });
    } else {
        return clearDB();
    }
});


describe('Shortest Path Test', () => {
    it('find itself as the shortest path', (done) => {
        new Subject({name: "English"}).save((err, subject) => {
            if (err) return done(err);
            new Person({name: "test", subjects: [subject._id], friends: []}).save((err, person) => {
                if (err) return done(err);
                chai.request(server.app)
                .post('/api/shortestPath')
                .set('Content-Type', 'application/json')
                .send({'person': person._id, 'subject': subject._id})
                .end((err, res) => {
                    if(err) return done(err);
                    expect(res.body[0]._id).to.be.eql(person._id.toString());
                    expect(res.status).to.be.equal(200);
                    done();
                });
            });
        });
    })

    it('find the shortest path', (done) => {
        new Subject({name: "English"}).save((err, subject) => {
            if (err) return done(err);
            new Person({name: "end", subjects: [subject._id], friends: []}).save((err, last) => {
                if (err) return done(err);
                new Person({name: "start", subjects: [], friends: [last._id]}).save((err, start) => {
                    if (err) return done(err);
                    chai.request(server.app)
                    .post('/api/shortestPath')
                    .set('Content-Type', 'application/json')
                    .send({'person': start._id, 'subject': subject._id})
                    .end((err, res) => {
                        if(err) return done(err);
                        expect(res.body[0]._id).to.be.eql(start._id.toString());
                        expect(res.body[1]._id).to.be.eql(last._id.toString());
                        expect(res.status).to.be.equal(200);
                        done();
                    });
                });
            });
        });
    })

})


describe('Person API Endpoints', () => {

    it('POST should not add a nonexistent friend', (done) => {
        chai.request(server.app)
        .post('/api/person')
        .set('Content-Type', 'application/json')
        .send({'name': 'this should not work', 'friends':['NO REAL FRIENDS'], 'subjects': []})
        .end((err, res) => {
            if(res.status !== 404) return done(err);
            expect(res.body.message).to.be.eql("Could not find friend NO REAL FRIENDS");
            expect(res.status).to.be.equal(404);
            done();
        });
    });

    it('POST should not add a nonexistent subject', (done) => {
        chai.request(server.app)
        .post('/api/person')
        .send({'name': 'this should not work', 'friends':[], 'subjects': ['THIS ISNT REAL']})
        .set('Content-Type', 'application/json')
        .end((err, res) => {
            if(res.status !== 404) return done(err);
            expect(res.body.message).to.be.eql("Could not find subject THIS ISNT REAL");
            expect(res.status).to.be.equal(404);
            done();
        });
    });

    it('can GET persons (0 persons)', (done) => {
        chai.request(server.app)
        .get('/api/persons')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
            if(err) return done(err);
            expect(res.body.length).to.be.eql(0);
            expect(res.status).to.be.equal(200);
            done();
        });
    });

    it('can GET persons (2 persons)', (done) => {
        new Person({name: "I have no friends", subjects: [], friends: []}).save((err, person) => {
            if (err) return done(err);
            new Person({name: "I don't know anything", subjects: [], friends: []})
            .save((err, person) => {
                if (err) return err;
                chai.request(server.app)
                .get('/api/persons')
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    if(err) return done(err);
                    expect(res.body.length).to.be.eql(2);
                    expect(res.status).to.be.equal(200);
                    done();
                });
            });
        });
    });
});

describe('Person Model', () => {
    it('can be saved', (done) => {
        new Subject({name: "English"}).save((err, subject) =>{
            if (err) return done(err);
            new Person({name: "test", subjects: [subject._id], friends: []}).save(done);
        });
    });

    it('can clear the DB', (done) => {
        new Person({name: "test", friends: [], subjects: []}).save((err, subject) => {
            if(err) return done(err);
            for (var i in mongoose.connection.collections) {
                mongoose.connection.collections[i].remove(() => {});
            }
            Subject.find({}, (error, subjects) => {
                expect(subjects.length).to.be.equal(0);
                done();
            });
        });
    });
})

after((done) => {
    mongoose.disconnect();
    return done();
});
