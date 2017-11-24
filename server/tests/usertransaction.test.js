const expect = require('expect');
const request = require('supertest');
const moment = require('moment');
const async = require('async');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {User} = require('./../model/user');
const {UserTransaction} = require('./../model/usertransaction');
const {users, populateUsers, inventory, populateInventory } = require('./seed/seed');
const usertransactiondata = [{
    "_id": new ObjectID(),
    "points" : 50,
    "transaction_type": "points_received_for_free",
    "user_id": users[0]._id,
    "item_id": null,
    "qty": "",
    "price": "",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf()
},
{
    "_id": new ObjectID(),
    "points" : 170,
    "transaction_type": "points_received_for_free",
    "user_id": users[0]._id,
    "item_id": null,
    "qty": "",
    "price": "",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf()
},
{
    "_id": new ObjectID(),
    "points" : 200,
    "transaction_type": "points_received_for_free",
    "user_id": users[0]._id,
    "item_id": null,
    "qty": "",
    "price": "",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf()
},
{
    "_id": new ObjectID(),
    "points" : 40,
    "transaction_type": "items_purchased_using_points",
    "user_id": users[0]._id,
    "item_id": inventory[0]._id,
    "qty": 4,
    "price": 10,
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf()
},
{
    "_id": new ObjectID(),
    "points" : 40,
    "transaction_type": "points_received_for_free",
    "user_id": users[0]._id,
    "item_id": null,
    "qty": "",
    "price": "",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf()
},
{
    "_id": new ObjectID(),
    "points" : 50,
    "transaction_type": "points_purchased",
    "user_id": users[0]._id,
    "item_id": null,
    "qty": "",
    "price": "",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf()
},
{
    "_id": new ObjectID(),
    "points" : 210,
    "transaction_type": "items_purchased_using_points",
    "user_id": users[0]._id,
    "item_id": inventory[0]._id,
    "qty": 21,
    "price": 10,
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf()
}
]
var populateUserTransactions = (done) => {
    UserTransaction.remove({}).then(() => {
        return UserTransaction.insertMany(usertransactiondata);
        done();
    }).then(() => {
        done();
    }).catch((err) => {
        done(err);
    });
};
beforeEach(populateUsers);
beforeEach(populateInventory);
beforeEach(populateUserTransactions);
/**
 * Test cases for POST /usertransaction
 * @param  {[type]} POST [description]
 * @param  {[type]} it   [description]
 * @return {[type]}      [description]
 */
describe('POST /usertransaction', () => {
    it('It should create a new user transaction', (done) => {
        var itemData = {
            "points": 50,
            "transaction_type":"points_received_for_free",
            "user_id":users[2]._id,
            "item_id":null,
            "qty":null,
            "price":null,
        };
        request(app)
        .post('/usertransaction')
        .set('x-auth', users[0].tokens[0].token)
        .send(itemData)
        .expect(200)
        .expect((response) => {
            expect(response.body.points).toBe(50);
            expect(response.body.transaction_type).toBe("points_received_for_free");
        })
        .end((err) => {
            if(err) {
                return done(err);
            }
            UserTransaction.findOne({"user_id": users[2]._id,"points":50,"transaction_type":"points_received_for_free"}).then((usertransaction) => {
                expect(usertransaction.points).toBe(50);
                expect(usertransaction.transaction_type).toBe("points_received_for_free");
                done();
            }).catch((err) => done(err));
        });
    });
    it('It should not create a user transaction for invalid user id', (done) => {
        var itemData = {
            "points": 50,
            "transaction_type":"points_received_for_free",
            "user_id":"InvalidUserId",
            "item_id":null,
            "qty":null,
            "price":null,
        };
        request(app)
        .post('/usertransaction')
        .set('x-auth', users[1].tokens[0].token)
        .send(itemData)
        .expect(404)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body._id).toNotExist();
            // done();
        })
        .end(done());
    });
    it('It should not create a user transaction for bad data', (done) => {
        var itemData = {
            "points": "dddddd",
            "transaction_type":"points_received_for_free",
            "user_id":users[2]._id,
            "item_id":"wwww",
            "qty":null,
            "price":null,
        };
        request(app)
        .post('/usertransaction')
        .set('x-auth', users[1].tokens[0].token)
        .send(itemData)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body._id).toNotExist();
        })
        .end(done());
    });
});
describe("GET /usertransaction", () => {
    it("It should fetch all user transactions", (done) => {
        request(app)
        .get('/usertransaction')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.usertransactions.length).toBe(usertransactiondata.length);
        })
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            UserTransaction.find().then((usertransactions) => {
                expect(usertransactions.length).toBe(usertransactiondata.length);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
describe("GET /usertransaction/:id", () => {
    it("It should return a usertransaction by id", (done) => {
        request(app)
        .get(`/usertransaction/${usertransactiondata[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.usertransaction.points).toBe(usertransactiondata[0].points)
        })
        .end(done);
    });

    it("It should return a 404 for invalid id of usertransaction by id", (done) => {
        request(app)
        .get(`/usertransaction/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect((res) => {
            //expect(res.body).toBe({});
        })
        .end(done);
    });

    it("It should return a 404 for non-object ids", (done) => {
        request(app)
        .get(`/usertransaction/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect((res) => {
            //expect(res.body).toBe({});
        })
        .end(done);
    });
});
describe("DELETE /usertransaction/:id", () => {
    it("It should remove a user transaction by id", (done) => {
        var hexId = usertransactiondata[0]._id.toHexString();
        request(app)
        .delete(`/usertransaction/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.usertransaction.text).toBe(usertransactiondata[0].text);
            expect(res.body.usertransaction._id).toBe(hexId);
        })
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            UserTransaction.findById(hexId).then((usertransaction) => {
                expect(usertransaction).toNotExist();
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    it("It should return a 404 for if user transaction id not found", (done) => {
        request(app)
        .delete(`/usertransaction/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it("It should return a 404 for object id is invalid", (done) => {
        request(app)
        .delete(`/usertransaction/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});
describe("PATCH /usertransaction/:id", () => {
    it("It should update a usertransaction by id", (done) => {
        var hexId = usertransactiondata[0]._id.toHexString();
        var body = {
            "points": 60,
            "qty":20,
            "price":3,
            "transaction_type":"items_purchased_using_points",
        };
        request(app)
        .patch(`/usertransaction/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(body)
        .expect(200)
        .expect((res) => {
            expect(res.body.usertransaction.points).toBe(60);
            expect(res.body.usertransaction._id).toBe(hexId);
            expect(res.body.usertransaction.qty).toBe(20);
            expect(res.body.usertransaction.price).toBe(3);
            expect(res.body.usertransaction.transaction_type).toBe("items_purchased_using_points");
        })
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            done();
        });
    });
    it("It should not update a user transaction having invalid data in request body", (done) => {
        var hexId = usertransactiondata[2]._id.toHexString();
        var body = {
            "points": 'InvalidDatatypeData',
            "qty":'InvalidDatatypeData',
            "price":'InvalidDatatypeData',
            "transaction_type":"dsjfklsdkfljsdlkjflkj",
        };
        request(app)
        .patch(`/usertransaction/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send(body)
        .expect(400)
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            done();
        });
    });

    it("It should not update a user transaction having invalid data in id", (done) => {
        var hexId = new ObjectID().toHexString();
        var body = {
            "points": 60,
            "qty":20,
            "price":3,
            "transaction_type":"items_purchased_using_points",
        };
        request(app)
        .patch(`/usertransaction/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send(body)
        .expect(404)
        .expect((res) => {
        })
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            done();
        });
    });
});
