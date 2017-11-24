var mongoose = require('mongoose');
const moment = require('moment');
const validator = require('validator');

var UserTransaction = mongoose.model('UserTransaction', {
    points: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'The {VALUE} must be between 0 and 200 inclusive.'],
        integer: true,
        required: true,
    },
    transaction_type: {
        type: String
        // type: {type: String,
        //         enum: [
        //             'points_received_for_free',
        //             'items_purchased_using_points',
        //             'points_purchased'
        //         ]
        //     },
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    item_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    qty: {
        type: Number,
        default: 0,
        min: [0, 'The {VALUE} must be an integer value.'],
        integer: true,
        required: false,
        trim: true
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'The {VALUE} must be between 0 or more than 0.'],
        integer: true,
        required: false,
        trim: true
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
});
module.exports = {UserTransaction};
