'use strict';

const env = process.env.NODE_ENV || 'dev',
    config = require('../config.js')[env],
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect,
    mongoose = require('mongoose'),
    server = require('../server.js'),
    Subject = require('../models/subject.js');

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

describe('Subject API Endpoints', () => {
    it('can GET list Subjects (0 subjects)', (done) => {
        chai.request(server.app)
        .get('/api/subjects')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
            if(err) return done(err);
            expect(res.body).to.be.eql([]);
            expect(res.status).to.be.equal(200);
            done();
        });
    });

    it('can GET list Subjects (1 subject)', (done) => {
        new Subject({name: "test"}).save((err, sub) => {
            if(err) return done(err);
            chai.request(server.app)
            .get('/api/subjects')
            .set('Content-Type', 'application/json')
            .end((err, res) => {
                if(err) return done(err);
                expect(res.body[0].name).to.be.equal("test");
                expect(res.status).to.be.equal(200);
                done();
            });
        });
    });

    it('can POST a new subject', (done) => {
        chai.request(server.app)
        .post('/api/subject')
        .send({'name': 'test'})
        .set('Content-Type', 'application/json')
        .end((err, res) => {
            if(err) return done(err);
            Subject.find({name: 'test'}, (err, subject) => {
                if(err) return done(err);
                expect(subject[0].name).to.equal('test');
                done();
            });
        });
    });

    it('can POST the same subject', (done) => {
        new Subject({name: "test"}).save((err, subject) => {
            if (err) return done(err);
            chai.request(server.app)
            .post('/api/subject')
            .send({'name': 'test'})
            .set('Content-Type', 'application/json')
            .end((err, res) => {
                if(err) return done(err);
                Subject.find({name: 'test'}, (err, subject) => {
                    if(err) return done(err);
                    expect(res.status).to.be.equal(200);
                    done();
                });
            });
        });
    });
});

describe('Subject Model', () => {
    it('can be saved', (done) => {
        new Subject({name: "test"}).save(done);
    });

    it('can be listed', (done) => {
        new Subject({name: "test"}).save((err, subject) => {
            if(err) return done(err);
            new Subject({name: "test2"}).save((err, subject) => {
                if (err) return done(err);
                Subject.find({}, (error, subjects) => {
                    expect(subjects.length).to.be.equal(2);
                    done();
                });
            });
        });
    });

    it('can clear the DB', (done) => {
        new Subject({name: "test"}).save((err, subject) => {
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
