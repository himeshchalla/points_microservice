var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var {User} = require('../model/user');
var {Inventory} = require('../model/inventory');
var {authenticate} = require('../middleware/authenticate');
var inventoryRouter = express.Router();
inventoryRouter.use(bodyParser.json());
const _ = require('lodash');
const {ObjectID} = require('mongodb');

/**
 * Add item / Save item route as a POST /
 * Save item/product data
 * @object {inventory}
 */
inventoryRouter.post('/', authenticate, (req, res, next) => {
    var body = _.pick(req.body, ['item_name', 'qty', 'price', 'description', 'createdAt', 'updatedAt', '_creator_id' ]);
    var inventory = new Inventory(body);
    inventory.save().then((doc) => {
     // Inventory saved successfully
     res.json(doc);
    }).catch((err) => {
     // Unable to save Inventory
     res.status(400).send(err);
    });
});
/**
* Fetch inventory route as a GET /inventory
* Get inventory
* @type {[type]}
*/
inventoryRouter.get('/', authenticate, (req, res) => {
    Inventory.find({
        // _creator_id : req.user._id
    }).then(
        (inventory)=> {
            // inventory fetched successfully and send it back as a response
            res.status(200).send({inventory});
        },
        (err) => {
            // Bad request so sending bad response
            res.status(400).send(err);
        }
    );
});
/**
* Fetch individual inventory item route by inventory id as a GET /inventory/123456
* Get individual inventory item by id
* @type {[type]}
*/
inventoryRouter.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    Inventory.findOne({
        _id: id,
    }).then((inventory) => {
        if(!inventory) {
            return res.status(404).send();
        }
        res.send({inventory});
    }).catch((err) => {
        res.status(400).send();
    });
});
/**
* Remove inventory item route as a DELETE /inventory/:id
* Delete inventory item by id
* @type {[type]}
*/
inventoryRouter.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    Inventory.findOneAndRemove({
        _id: id,
        // _creator_id : req.user._id
    }).then((inventory) => {
        if(!inventory) {
            return res.status(404).send();
        }
        res.status(200).send({inventory});
    }).catch((err) => {
        res.status(400).send();
    });
});
/**
* Update inventory item route as a PATCH /inventory/:id
* Update inventory item by id
* @type {[type]}
*/
inventoryRouter.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['item_name', 'qty', 'price' ]);
    body.updatedAt = moment().valueOf();
    var inventory = new Inventory(body);
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    }
    Inventory.findOneAndUpdate(
        {
            _id: id,
        },
        {$set:body},
        {new: true}
    ).then((inventory) => {
        if(!inventory) {
            res.status(404).send();
        }
        res.send({inventory});
    }).catch((error) => {
        res.status(400).send();
    });
});

module.exports = inventoryRouter;
