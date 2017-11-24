const config = require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const port = process.env.PORT || 3000;
var {User} = require('./model/user');
var {Inventory} = require('./model/inventory');
var {UserTransaction} = require('./model/usertransaction');
var {authenticate} = require('./middleware/authenticate');
var users = require('./controller/user.controller');
var inventory = require('./controller/inventory.controller');
var usertransaction = require('./controller/usertransaction.controller');
var app = express();
app.use(bodyParser.json());
app.use('/users',users);
app.use('/inventory',inventory);
app.use('/usertransaction',usertransaction);
/**
 * Used to perform user connection operation to check for successfully connection
 * @type {[type]}
 */
app.post('/connect', (req, res, next) => {
    var body = _.pick(req.body,['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            var user_items = User.getItemsByUserId(user._id).then((items) => {
                var res_data = new Object({
                    'user_inventory':JSON.stringify(items),
                    'user':user
                });
                res.header("x-auth", token);
                res.status(200).json(res_data);
                return items;
            }).catch((e) => {
                res.status(400).send();
            });
        });
    }).catch((e) => {
        res.status(400).send();
    });
});
/**
* Fetch user's free and purchased points using a GET /getPoints
* Get User Points
* @type {[type]}
*/
app.get('/getPoints', authenticate, (req, res) => {
    if(req.user._id != '') {
        // data fetched successfully now send it back in the response
        res.status(200).send({
            "free_points":req.user.free_points,
            "purchased_points":req.user.purchased_points
        });
    }
});
/**
* Used to get Items purchased by user as a GET /getItems
* Get individual user's purchased items
* @type {[type]}
*/
app.get('/getItems', authenticate, (req, res) => {
    var user_id = req.user._id;
    if(!ObjectID.isValid(user_id)) {
        res.status(404).send();
    }
    //fetch and send only user's purchased items from user transactions
    UserTransaction.find({
        "user_id": user_id,
        "transaction_type": "items_purchased_using_points"
    }).then((usertransactiondata) => {
        if(!usertransactiondata) {
            return res.status(404).send();
        }
        res.status(200).send({
            "purchased_items":usertransactiondata,
        });
    }).catch((err) => {
        res.status(400).send();
    });
});
/**
 * let user buy an item which is present in backend inventory : route as a PATCH /todos/:id
 * Update item and add user transactions by inventory id
 * @type {[type]}
 */
app.patch('/purchaseItem/:id/:qty', authenticate, (req, res) => {
    var item_id = req.params.id;
    var qty = req.params.qty;
    var user_id = req.user._id;
    if( (!ObjectID.isValid(item_id)) || (Math.abs(qty) < 1) ) {
        res.status(404).send('Invalid request data');
    }
    Inventory.findOne({
        _id: item_id,
    }).then((inventory) => {
        var item_amount = qty*inventory.price;
        var total_user_points = req.user.free_points+req.user.purchased_points;
        if(!inventory) {
            return res.status(400).send('Item does not exists');
        }
        if(inventory.qty <= qty ) {
            return res.status(400).send('Requested quantities are not available in the inventory');
        }
        if(total_user_points <= item_amount ) {
            return res.status(400).send('User does not have enough points to purchase this item');
        }
        var spending_amount = item_amount;
        var remaining_free_points = req.user.free_points;
        var remaining_purchased_points = req.user.purchased_points;
        var spending_free_points = 0;
        var spending_purchased_points = 0;
        var remaining_item_qty = inventory.qty - qty;
        // First priority to spend user's free points only
        if(item_amount <= req.user.free_points) {
            spending_free_points = item_amount;
            remaining_free_points = req.user.free_points - item_amount;
            remaining_purchased_points = req.user.purchased_points;
        } else {
            spending_free_points = req.user.free_points;
            spending_purchased_points =  item_amount - req.user.free_points;
            remaining_free_points = req.user.free_points - spending_free_points;
            remaining_purchased_points = req.user.purchased_points - spending_purchased_points;
        }
        var item_data = {
            "qty":remaining_item_qty,
            "updatedAt":moment().valueOf()
        };
        Inventory.findOneAndUpdate(
            {
                _id: item_id
            },
            {$set:item_data},
            {new:false, returnNewDocument : true }
        ).then((updated_inventory) => {
            if(!updated_inventory) {
                res.status(404).send();
            }
            // Item inventory data updated succssfully now update user for points
            var user_data = {
                "free_points":remaining_free_points,
                "purchased_points":remaining_purchased_points,
                "updatedAt":moment().valueOf()
            };
            User.findOneAndUpdate(
                {
                    _id: user_id,
                },
                {$set:user_data},
                {new:false, returnNewDocument : true }
            ).then((updated_user) => {
                if(!updated_user) {
                    res.status(404).send();
                }
                // Create User transaction
                var usertransactionData = {
                    "points": item_amount,
                    "transaction_type":"items_purchased_using_points",
                    "user_id":user_id,
                    "item_id":item_id,
                    "qty":qty,
                    "price":inventory.price,
                    "createdAt":moment().valueOf(),
                    "updatedAt":moment().valueOf()
                };
                var usertransaction = new UserTransaction(usertransactionData);
                usertransaction.save().then((usertransaction_data) => {
                 // User Transcation saved successfully
                    res.status(200).send({"usertransaction":usertransaction_data._doc});
                }).catch((err) => {
                 // Unable to save User Transcation
                 res.status(400).send(err);
                });
            }).catch((error) => {
                // Unable to update User data
                res.status(400).send(error);
            });
        }).catch((error) => {
            // Unable to update Item inventory data
            res.status(400).send(error);
        });
    }).catch((err) => {
        // Unable to Find Item in the inventory
        res.status(400).send(err);
    });
});
/**
* Used to get Inventory as a GET /getInventory
* Get Inventory for item available to purchase by users
* @type {[type]}
*/
app.get('/getInventory', authenticate, (req, res) => {
    var user_id = req.user._id
    if(!ObjectID.isValid(user_id)) {
        res.status(404).send();
    }
    //fetch and send only item available to purchase by users
    Inventory.find({
        'qty': { $gt : 0}
    }).then((available_items) => {
        if(!available_items) {
            return res.status(404).send();
        }
        res.send({'available_items':available_items});
    }).catch((err) => {
        res.status(400).send();
    });
});

/**
 * Give free points to every user who has free points below upper limit of free points
 * @return {[type]} [description]
 */
var addFreePoints = function() {
    const free_points_upper_limit = 200;
    const free_points_cycle_limit = 50;
    const user_data = User.find({
    }).then((users)=>{
        if(!users) {
            return;
        }
        users.forEach((user) => {
            if(user.free_points < free_points_upper_limit) {
                var free_points = free_points_cycle_limit;
                var upper_limit_points_diff = free_points_upper_limit - user.free_points;
                if( upper_limit_points_diff < free_points ) {
                    free_points = upper_limit_points_diff;
                }
                // Update User collection for giving free points by system
                var user_data = {
                    "free_points":(user.free_points+free_points),
                    "updatedAt":moment().valueOf()
                };
                User.findOneAndUpdate(
                    {
                        _id: user._id,
                    },
                    {$set:user_data},
                    {new:false, returnNewDocument : true }
                ).then((updated_user) => {
                    // Create User transaction
                    var usertransactionData = {
                        "points": free_points,
                        "transaction_type":"points_received_for_free",
                        "user_id":user._id,
                        "item_id":null,
                        "qty":null,
                        "price":null,
                        "createdAt":moment().valueOf(),
                        "updatedAt":moment().valueOf()
                    };
                    var usertransaction = new UserTransaction(usertransactionData);
                    usertransaction.save().then((usertransaction_data) => {
                     // User Transcation saved successfully
                        console.log('Free '+free_points+' points given to user:'+user.username);
                    }).catch((err) => {
                     // Unable to save User Transcation
                     console.log(err);
                    });
                }).catch((error) => {
                    // Unable to update User data
                    console.log(error);
                });
            }
        });
        // return new Promise().resolve();
    }).catch((err) => {
        console.log('Unable to add free points into user account');
        console.log(err);
    });
}

app.listen(port,() => {
    addFreePoints();
    //Give free points to each user every 3 hours if user has free points below upper limit of free points
    setInterval(addFreePoints, (1000*60*60*3));
    console.log(`Server started on port : ${port}`);
});

module.exports = {app}
