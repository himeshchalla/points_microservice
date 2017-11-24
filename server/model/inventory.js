const mongoose = require('mongoose');
const moment = require('moment');
const validator = require('validator');

var Inventory = mongoose.model('Inventory', {
    item_name: {
        type: String,
        required: true,
        minlength: 2,
        trim: true
    },
    qty: {
        type: Number,
        default: 0,
        min: [0, 'The {VALUE} must be an integer value.'],
        integer: true,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'The {VALUE} must be between 0 or more than 0.'],
        integer: true,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 512,
        trim: true
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
    _creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
});
module.exports = {Inventory};
