const expect = require('expect');
const request = require('supertest');
const moment = require('moment');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {users,
    populateUsers,
    inventory,
    populateInventory,
    usertransactions,
    populateUsertransactions,
    } = require('./seed/seed');
const {Inventory} = require('./../model/inventory');

// Used to perform task before each test case run
beforeEach(populateUsers);
beforeEach(populateInventory);
/**
 * Test cases for POST /Inventory
 * @param  {[type]} POST [description]
 * @param  {[type]} it   [description]
 * @return {[type]}      [description]
 */
describe('POST /inventory', () => {
    it('It should create a new item inventory', (done) => {
        var itemData = {
            "item_name": "Test Item111",
            "qty":578,
            "price":2,
            "description":"Test item111 from post item inventory success case",
            "createdAt": moment().valueOf(),
            "updatedAt": moment().valueOf(),
            "_creator_id": users[0]._id
        };
        request(app)
        .post('/inventory')
        .set('x-auth', users[0].tokens[0].token)
        .send(itemData)
        .expect(200)
        .expect((response) => {
            expect(response.body.item_name).toExist();
            expect(response.body.item_name).toBe('Test Item111');
            expect(response.body.qty).toBe(578);
        })
        .end((err) => {
            if(err) {
                return done(err);
            }
            Inventory.findOne({"item_name": "Test Item111"}).then((inventory) => {
                expect(inventory).toExist();
                expect(inventory.item_name).toBe('Test Item111');
                expect(inventory.qty).toBe(578);
                done();
            }).catch((err) => done(err));
        });
    });

    it('It should not create a new item inventory for bad data', (done) => {
        var itemData = {
            "item_name": "Test Item222",
            "qty":"sdfsdfsdfsdf",
            "price":"erwerwerwerwer",
            "description":"Test item111 from post item inventory success case",
            "_creator_id": users[0]._id
        }
        request(app)
        .post('/inventory')
        .set('x-auth', users[0].tokens[0].token)
        .send(itemData)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body._id).toNotExist();
        })
        .end(done());
    });
});

describe("GET /inventory", () => {
    it("It should fetch all inventory items", (done) => {
        request(app)
        .get('/inventory')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.inventory.length).toBe(inventory.length);
        })
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            Inventory.find().then((inventorydata) => {
                expect(inventorydata.length).toBe(inventory.length);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
describe("GET /inventory/:id", () => {
    it("It should return a inventory item by id", (done) => {
        request(app)
        .get(`/inventory/${inventory[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.inventory.text).toBe(inventory[0].text)
        })
        .end(done);
    });

    it("It should return a 404 for invalid id of inventory item by id", (done) => {
        request(app)
        .get(`/inventory/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect((res) => {
            //expect(res.body).toBe({});
        })
        .end(done);
    });

    it("It should return a 404 for non-object ids", (done) => {
        request(app)
        .get(`/inventory/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect((res) => {
            //expect(res.body).toBe({});
        })
        .end(done);
    });
});
describe("DELETE /inventory/:id", () => {
    it("It should remove a inventory item by id", (done) => {
        var hexId = inventory[0]._id.toHexString();
        request(app)
        .delete(`/inventory/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.inventory.text).toBe(inventory[0].text);
            expect(res.body.inventory._id).toBe(hexId);
        })
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            Inventory.findById(hexId).then((inventory) => {
                expect(inventory).toNotExist();
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    it("It should return a 404 for if inventory item id not found", (done) => {
        request(app)
        .delete(`/inventory/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it("It should return a 404 for object id is invalid", (done) => {
        request(app)
        .delete(`/inventory/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});
describe("PATCH /inventory/:id", () => {
    it("It should update a inventory item by id", (done) => {
        var hexId = inventory[0]._id.toHexString();
        var body = {
            "item_name": "Test Item22222",
            "qty":754,
            "price":3,
        };
        request(app)
        .patch(`/inventory/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(body)
        .expect(200)
        .expect((res) => {
            expect(res.body.inventory.item_name).toBe('Test Item22222');
            expect(res.body.inventory._id).toBe(hexId);
            expect(res.body.inventory.qty).toBe(754);
            expect(res.body.inventory.price).toBe(3);
        })
        .end((err, response) => {
            if(err) {
                return done(err);
            }
            done();
        });
    });

    it("It should not update a inventory item having invalid data in request body", (done) => {
        var hexId = inventory[0]._id.toHexString();
        var body = {
            "item_name": "Test Item22222",
            "qty":"sdfsdfsdfsdf",
            "price":"sfsdfsdfsdf",
        };
        request(app)
        .patch(`/inventory/${hexId}`)
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

    it("It should not update a inventory item having invalid data in id", (done) => {
        var hexId = new ObjectID().toHexString();
        var body = {
            "item_name": "Test Item22222",
            "qty":754,
            "price":3,
        };
        request(app)
        .patch(`/inventory/${hexId}`)
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
