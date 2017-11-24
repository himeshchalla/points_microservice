const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {users,
    populateUsers,
    inventory,
    populateInventory,
    usertransactions,
    populateUsertransactions
    } = require('./seed/seed');
const {User} = require('./../model/user');

// Used to perform task before each test case run
beforeEach(populateUsers);
beforeEach(populateInventory);

describe('GET /users/me', () => {
    it('It should return user if authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });
    it('It should return 401 if user not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', 'some_invalid_token_string')
        .expect(401)
        .expect((res) => {
            expect(res.body).toExist({});
        })
        .end(done);
    });
});

describe('POST /users/login', () => {
    it("It should login user and return auth token", (done) => {
        request(app)
        .post("/users/login")
        .send(users[2])
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            User.findById(users[2]._id).then((user) => {
                expect(user.tokens[1]).toInclude({
                    access:'auth',
                    token:res.headers['x-auth']
                });
                // expect(user.tokens[0]).toBeA('object');
                done();
            }).catch((err) => done(err));
        })
    });

    it("It should reject invalid login", (done) => {
        var invalid_request_data = users[2];
        invalid_request_data.password = invalid_request_data.password+"Invalid_password";
        request(app)
        .post("/users/login")
        .send(invalid_request_data)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            User.findById(users[2]._id).then((user) => {
                expect(user.tokens.length).toBe(1);
                done();
            }).catch((err) => done(err));
        });
    });
});

describe('DELETE /users/me/token', () => {
    it("It should remove auth token on logout", (done) => {
        request(app)
        .delete("/users/me/token")
        .set('x-auth', users[0].tokens[0].token)
        .send()
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((err) => done(err));
        })
    });
});

describe('POST /users', () => {
    it('It should create a user if everything is valid', (done) => {
        var email = "example@example.com";
        var password = "abcdefghijkl";
        var userData = {
            "email": email,
            "password":password,
            "username":"testUser1",
            "free_points":170,
            "purchased_points":0,
        }
        request(app)
        .post('/users')
        .send(userData)
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        })
        .end((err) => {
            if(err) {
                return done(err);
            }
            User.findOne({email}).then((user) => {
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            }).catch((err) => done(err));
        });
    });

    it('It should return validation errors if request is invalid', (done) => {
        var email = "InvalidEmailString";
        var password = "ab";
        var userData = {
            "email": email,
            "password":password,
            "username":"testUser1",
            "free_points":20,
            "purchased_points":0,
        }
        request(app)
        .post('/users')
        .send(userData)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body._id).toNotExist();
            expect(res.body._id).toNotExist();
        })
        .end(done());
    });

    it('It should not create a user if email is already used', (done) => {
        var email = users[0].email;
        var password = "testUserPassword";
        var userData = {
            "email": email,
            "password":password,
            "username":"testUser1",
            "free_points":40,
            "purchased_points":50,
        }
        request(app)
        .post('/users')
        .send(userData)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body._id).toNotExist();
        })
        .end(done());
    });
});
