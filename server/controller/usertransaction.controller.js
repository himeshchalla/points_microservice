const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const _ = require('lodash');
const userTransactionRouter = express.Router();
var {User} = require('../model/user');
var {UserTransaction} = require('../model/usertransaction');
var {authenticate} = require('../middleware/authenticate');
const {ObjectID} = require('mongodb');
userTransactionRouter.use(bodyParser.json());
/**
 * Add user transaction / Save user transaction route as a POST /
 * Save user transaction data
 * @object {inventory}
 */
userTransactionRouter.post('/', authenticate, (req, res, next) => {
    var body = _.pick(req.body, ['points', 'transaction_type', 'user_id', 'item_id', 'qty', 'price' ]);
    body.user_id = req.user._id;
    if(!ObjectID.isValid(body.user_id)) {
        res.status(404).send();
    }
    body.createdAt = moment().valueOf();
    body.updatedAt = moment().valueOf();
    var usertransaction = new UserTransaction(body);
    usertransaction.save().then((doc) => {
     // User Transcation saved successfully
     res.json(doc);
    //  Promise.resolve();
    }).catch((err) => {
     // Unable to save Inventory
     res.status(400).send(err);
    });
});
/**
* Fetch all transactions route as a GET /usertransaction
* Get user transaction data
* @type {[type]}
*/
userTransactionRouter.get('/', authenticate, (req, res) => {
    UserTransaction.find({
        // _creator_id : req.user._id
    }).then(
        (usertransactions)=> {
            // UserTransaction fetched successfully and send it back as a response
            res.status(200).send({usertransactions});
        },
        (err) => {
            // Bad request so sending bad response
            res.status(400).send(err);
        }
    );
});
/**
* Fetch User Transaction route by User Transaction id as a GET /usertransaction/123456
* Get individual User Transaction by id
* @type {[type]}
*/
userTransactionRouter.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    UserTransaction.findOne({
        _id: id,
    }).then((usertransaction) => {
        if(!usertransaction) {
            return res.status(404).send();
        }
        res.send({usertransaction});
    }).catch((err) => {
        res.status(400).send();
    });
});
/**
* Remove User Transaction route as a DELETE /usertransaction/:id
* Delete User Transaction by id
* @type {[type]}
*/
userTransactionRouter.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    UserTransaction.findOneAndRemove({
        _id: id,
    }).then((usertransaction) => {
        if(!usertransaction) {
            return res.status(404).send();
        }
        res.status(200).send({usertransaction});
    }).catch((err) => {
        res.status(400).send();
    });
});
/**
* Update user transaction route as a PATCH /usertransaction/:id
* Update user transaction by id
* @type {[type]}
*/
userTransactionRouter.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['points', 'qty', 'price', 'transaction_type']);
    body.updatedAt = moment().valueOf();
    var usertransaction = new UserTransaction(body);
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    UserTransaction.findOneAndUpdate(
        {
            _id: id,
        },
        {$set:body},
        {new:true, returnNewDocument : true }
    ).then((usertransaction) => {
        if(!usertransaction) {
            res.status(404).send();
        }
        res.send({usertransaction});
    }).catch((error) => {
        res.status(400).send();
    });
});
module.exports = userTransactionRouter;
