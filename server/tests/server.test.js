const expect = require('expect');
const request = require('supertest');
const moment = require('moment');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {users, populateUsers, inventory, populateInventory} = require('./seed/seed');
const {User} = require('./../model/user');
const {Inventory} = require('./../model/inventory');
const {UserTransaction} = require('./../model/usertransaction');
//Dummy test data seeds
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
];
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
// Used to perform task before each test case run
beforeEach(populateUsers);
beforeEach(populateInventory);
beforeEach(populateUserTransactions);
// /**
//  * Test cases for POST /connect
//  * @param  {[type]} POST [description]
//  * @param  {[type]} it   [description]
//  * @return {[type]}      [description]
//  */
// describe('POST /connect', () => {
//     it("It should connect user and return auth token along with other details", (done) => {
//         request(app)
//         .post("/connect")
//         .send(users[0])
//         .expect(200)
//         .expect((res) => {
//             expect(res.headers['x-auth']).toExist();
//             expect(res.body.user).toExist();
//             expect(res.body.user.free_points).toExist();
//             expect(res.body.user.purchased_points).toExist();
//             expect(res.body.user_inventory).toExist();
//             done();
//         })
//         .end((err, res) => {
//             if(err) {
//                 return done(err);
//             }
//         })
//     }).timeout(4000);
//
//     it("It should reject invalid connect", (done) => {
//         var invalid_request_data = users[2];
//         invalid_request_data.password = invalid_request_data.password+"Invalid_password";
//         request(app)
//         .post("/connect")
//         .send(invalid_request_data)
//         .expect(400)
//         .expect((res) => {
//             expect(res.headers['x-auth']).toNotExist();
//         })
//         .end((err, res) => {
//             if(err) {
//                 return done(err);
//             }
//             User.findById(users[2]._id).then((user) => {
//                 expect(user.tokens.length).toBe(1);
//                 done();
//             }).catch((err) => done(err));
//         });
//     }).timeout(4000);
// });
// /**
//  * Test cases for GET /getPoints
//  * @param  {[type]} POST [description]
//  * @param  {[type]} it   [description]
//  * @return {[type]}      [description]
//  */
//  describe("GET /getPoints", () => {
//      it("It should fetch user's free and purchased points", (done) => {
//          request(app)
//          .get('/getPoints')
//          .set('x-auth', users[0].tokens[0].token)
//          .expect(200)
//          .expect((res) => {
//              expect(res.body.free_points).toExist();
//              expect(res.body.purchased_points).toExist();
//              done();
//          })
//          .end((err, response) => {
//              if(err) {
//                  return done(err);
//              }
//          });
//      }).timeout(1000);
//
//      it("It should not fetch user's free and purchased points for invalid token", (done) => {
//          request(app)
//          .get('/getPoints')
//          .set('x-auth', "DummyInvalidUserTokenString")
//          .expect(401)
//          .expect((res) => {
//              done();
//          })
//          .end((err, response) => {
//              if(err) {
//                  return done(err);
//              }
//          });
//      }).timeout(1000);
//  });
//  /**
//   * Test cases for GET /getItems
//   * @param  {[type]} POST [description]
//   * @param  {[type]} it   [description]
//   * @return {[type]}      [description]
//   */
//   describe("GET /getItems", () => {
//       it("It should get Items purchased by user", (done) => {
//           request(app)
//           .get('/getItems')
//           .set('x-auth', users[0].tokens[0].token)
//           .expect(200)
//           .expect((res) => {
//               expect(res.body.purchased_items).toBeA('array');
//               expect(res.body.purchased_items[0].user_id).toBe(users[0]._id.toString());
//               expect(res.body.purchased_items[0].transaction_type).toBe('items_purchased_using_points');
//               done();
//           })
//           .end((err, response) => {
//               if(err) {
//                   return done(err);
//               }
//           });
//       }).timeout(1000);
//
//       it("It should not get Items purchased by user", (done) => {
//           request(app)
//           .get('/getItems')
//           .set('x-auth', "DummyInvalidUserTokenString")
//           .expect(401)
//           .expect((res) => {
//               done();
//           })
//           .end((err, response) => {
//               if(err) {
//                   return done(err);
//               }
//           });
//       }).timeout(1000);
//
//       it("It should return empty items purchased by user", (done) => {
//           request(app)
//           .get('/getItems')
//           .set('x-auth', users[2].tokens[0].token)
//           .expect(200)
//           .expect((res) => {
//               expect(res.body.purchased_items).toBeA('array');
//               expect(res.body.purchased_items.length).toBe(0);
//               done();
//           })
//           .end((err, response) => {
//               if(err) {
//                   return done(err);
//               }
//           });
//       }).timeout(1000);
//   });
    /**
    * Test cases for PATCH /purchaseItem
    * @param  {[type]} PATCH [description]
    * @param  {[type]} it   [description]
    * @return {[type]}      [description]
    */
    describe("let user buy an item which is present in backend inventory PATCH /purchaseItem/:id", () => {
      it("It should let user buy an item which is present in the backend inventory", (done) => {
          var hexId = inventory[0]._id.toHexString();
          var qty = 3;
          request(app)
          .patch(`/purchaseItem/${hexId}/${qty}`)
          .set('x-auth', users[0].tokens[0].token)
          .send({})
          .expect(200)
          .expect((res) => {
              expect(res.body.usertransaction).toBeA('object');
              expect(res.body.usertransaction.user_id).toBe(users[0]._id.toString());
              expect(res.body.usertransaction.qty).toBe(3);
              expect(res.body.usertransaction.item_id).toBe(hexId);
              expect(res.body.usertransaction.transaction_type).toBe('items_purchased_using_points');
              done();
          })
          .end((err, response) => {
              if(err) {
                  return done(err);
              }
          });
      });

      it("It should not let user buy an item which is present in the backend inventory having invalid data in request body", (done) => {
          var hexId = inventory[0]._id.toHexString();
          var qty = 'sdsdsdsd';
          request(app)
          .patch(`/purchaseItem/${hexId}/${qty}`)
          .set('x-auth', users[0].tokens[0].token)
          .send({})
          .expect(400)
          .expect((res) => {
              done();
          })
          .end((err, response) => {
              if(err) {
                  return done(err);
              }
          });
      });
        it("It should not let user buy an item which is present in the backend inventory having invalid data in id", (done) => {
            var hexId = new ObjectID().toHexString();
            var qty = 'sdsdsdsd';
            request(app)
            .patch(`/purchaseItem/${hexId}/${qty}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .expect((res) => {
                done();
            })
            .end((err, response) => {
                if(err) {
                    return done(err);
                }
            });
        });
        it("It should not let user buy an item which is present in the backend inventory having above user's buying capacity", (done) => {
            var hexId = inventory[0]._id.toHexString();
            var qty = 30;
            request(app)
            .patch(`/purchaseItem/${hexId}/${qty}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .expect((res) => {
                done();
            })
            .end((err, response) => {
                if(err) {
                    return done(err);
                }
            });
        });
    });
    // /**
    // * Test cases for GET /getItems
    // * @param  {[type]} POST [description]
    // * @param  {[type]} it   [description]
    // * @return {[type]}      [description]
    // */
    // describe("GET /getInventory", () => {
    //   it("It should get Items available to be purchased by user", (done) => {
    //       request(app)
    //       .get('/getInventory')
    //       .set('x-auth', users[0].tokens[0].token)
    //       .expect(200)
    //       .expect((res) => {
    //           expect(res.body.available_items).toBeA('array');
    //           expect(res.body.available_items.length).toNotBe(0);
    //           done();
    //       })
    //       .end((err, response) => {
    //           if(err) {
    //               return done(err);
    //           }
    //       });
    //   }).timeout(1000);
    // });
