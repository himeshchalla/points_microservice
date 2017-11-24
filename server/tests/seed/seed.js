//mocha --debug-brk --inspect --allow-uncaught --full-trace --no-warnings --recursive ./server/**/*.test.js
const {ObjectID} = require('mongodb');
const {User} = require('./../../model/user');
const {Inventory} = require('./../../model/inventory');
const {UserTransaction} = require('./../../model/usertransaction');
const jwt = require('jsonwebtoken');
const moment = require('moment');

// Initial test data of users
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();
const users = [{
    "_id": userOneId,
    "email":"test1@example.com",
    "password":"userOnePass",
    "username":"testUser1",
    "free_points":50,
    "purchased_points":10,
    "tokens": [{
        "access": 'auth',
        "token": jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET_KEY).toString()
    }]
},
{
    "_id": userTwoId,
    "email":"test2@example.com",
    "password":"testpassword2",
    "username":"testUser2",
    "free_points":100,
    "purchased_points":0,
    "tokens": [{
        "access": 'auth',
        "token": jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET_KEY).toString()
    }]
},
{
    "_id": userThreeId,
    "email":"test3@example.com",
    "password":"testpassword3",
    "username":"testUser3",
    "free_points":170,
    "purchased_points":150,
    "tokens": [{
        "access": 'auth',
        "token": jwt.sign({_id: userThreeId, access: 'auth'}, process.env.JWT_SECRET_KEY).toString()

    }]
}
];
const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        var userThree = new User(users[2]).save();
        return Promise.all([userOne, userTwo, userThree]);
    })
    .then((data) => {
        done();
    })
    .catch((err) => done(err));
}

// Initial test data of item inventory
const inventory = [{
    "_id": new ObjectID(),
    "item_name" : "item1",
    "qty": 500,
    "price": 10,
    "description": "test Item1 in inventory ",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf(),
    "_creator_id": userOneId,
},
{
    "_id": new ObjectID(),
    "item_name" : "item2",
    "qty": 200,
    "price": 20,
    "description": "test Item2 in inventory ",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf(),
    "_creator_id": userTwoId,
},
{
    "_id": new ObjectID(),
    "item_name" : "item3",
    "qty": 300,
    "price": 15,
    "description": "test Item3 in inventory ",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf(),
    "_creator_id": userOneId,
},
{
    "_id": new ObjectID(),
    "item_name" : "item4",
    "qty": 0,
    "price": 10,
    "description": "test Item4 in inventory ",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf(),
    "_creator_id": userOneId,
},
{
    "_id": new ObjectID(),
    "item_name" : "item5",
    "qty": 0,
    "price": 10,
    "description": "test Item5 in inventory ",
    "createdAt": moment().valueOf(),
    "updatedAt": moment().valueOf(),
    "_creator_id": userOneId,
}];
// Used to perform task before each test case run
const populateInventory = (done) => {
    Inventory.remove({}).then(() => {
        return Inventory.insertMany(inventory);
    }).then((result) => {
        done();
    }).catch((err) => {
        done(err);
    });
};
// //Initial test data of user transaction
// const usertransactiondata = [{
//     "_id": new ObjectID(),
//     "points" : 50,
//     "transaction_type": "points_received_for_free",
//     "user_id": userOneId,
//     "item_id": null,
//     "qty": "",
//     "price": "",
//     "createdAt": moment().valueOf(),
//     "updatedAt": moment().valueOf()
// },
// {
//     "_id": new ObjectID(),
//     "points" : 170,
//     "transaction_type": "points_received_for_free",
//     "user_id": userOneId,
//     "item_id": "",
//     "qty": "",
//     "price": "",
//     "createdAt": moment().valueOf(),
//     "updatedAt": moment().valueOf()
// },
// {
//     "_id": new ObjectID(),
//     "points" : 200,
//     "transaction_type": "points_received_for_free",
//     "user_id": userOneId,
//     "item_id": "",
//     "qty": "",
//     "price": "",
//     "createdAt": moment().valueOf(),
//     "updatedAt": moment().valueOf()
// },
// {
//     "_id": new ObjectID(),
//     "points" : 40,
//     "transaction_type": "items_purchased_using_points",
//     "user_id": userOneId,
//     "item_id": inventory[0]._id,
//     "qty": 4,
//     "price": 10,
//     "createdAt": moment().valueOf(),
//     "updatedAt": moment().valueOf()
// },
// {
//     "_id": new ObjectID(),
//     "points" : 40,
//     "transaction_type": "points_received_for_free",
//     "user_id": userOneId,
//     "item_id": "",
//     "qty": "",
//     "price": "",
//     "createdAt": moment().valueOf(),
//     "updatedAt": moment().valueOf()
// },
// {
//     "_id": new ObjectID(),
//     "points" : 50,
//     "transaction_type": "points_purchased",
//     "user_id": userOneId,
//     "item_id": "",
//     "qty": "",
//     "price": "",
//     "createdAt": moment().valueOf(),
//     "updatedAt": moment().valueOf()
// },
// {
//     "_id": new ObjectID(),
//     "points" : 210,
//     "transaction_type": "items_purchased_using_points",
//     "user_id": userOneId,
//     "item_id": inventory[0]._id,
//     "qty": 21,
//     "price": 10,
//     "createdAt": moment().valueOf(),
//     "updatedAt": moment().valueOf()
// }
// ];
// // Used to perform task before each test case run
// module.exports = populateUserTransactions = (done) => {
//     UserTransaction.remove({}).then(() => {
//         return UserTransaction.insertMany(usertransactiondata);
//     }).then(() => {
//         done();
//     }).catch((err) => {
//         done(err);
//     });
// };
module.exports = {
    users,
    populateUsers,
    inventory,
    populateInventory,
    // usertransactiondata,
    // populateUserTransactions,
};
