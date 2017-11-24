const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const {UserTransaction} = require('./usertransaction');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
        unique : true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    username: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    free_points: {
        type: Number,
        default: 0,
        min: [0, 'The {VALUE} must be between 0 and 200 inclusive.'],
        max: [200, 'The {VALUE} must be between 0 and 200 inclusive.'],
        integer: true,
        required: true,
    },
    purchased_points: {
        type: Number,
        default: 0,
        min: [0, 'The {VALUE} must be between 0 or more than 0.'],
        integer: true,
        required: true,
        // validate: validator.isInt
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
});

/**
 * Used to override object.json data to send custom data from user object instead of all user's information
 * @return {object} [user object with minimal user data]
 */
UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email', 'free_points', 'purchased_points']);
};

/**
 * [Method is useful to generate user auth token for user authentication]
 * @return {[string]} [Returns token String which is user auth token]
 */
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET_KEY).toString();
    user.tokens.push({access, token});
    return user.save().then((savedUserData) => {
        // console.log("User saved successfully -> token:"+JSON.stringify(token, undefined, 4));
        // console.log("User saved successfully -> savedUserData:"+JSON.stringify(savedUserData, undefined, 4));
        return token;
    }, (err) => {
        // console.log('Unable to store userAuthToken:'+JSON.stringify(err, undefined, 4));
    });
};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // console.log("Decoded token:"+JSON.stringify(decoded, undefined, 4));
    } catch(e) {
        console.log("Error: Token unhashing issue:"+e);
        return Promise.reject();
    }
    var userdata = User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
    return userdata;
};

UserSchema.pre('save', function(next) {
    var user = this;
    try {
        user.createdAt = moment().valueOf();
        user.updatedAt = moment().valueOf();
        if(user.isModified('password')) {
            bcrypt.genSalt(10, (err, salt) => {
                // console.log('Generating and hashing user password to store in the database');
                bcrypt.hash(user.password, salt, (err, hash) => {
                    user.password = hash;
                    // console.log('User hashed password:'+user.password);
                    next();
                });
            });
        } else {
            next();
        }
    } catch(e) {
        // console.log("Error in processing password hashing:"+e);
        next();
    }
});

UserSchema.statics.findByCredentials = function(email, password) {
    var User = this;
    return User.findOne({"email":email}).then((user) => {
        if(!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            // Compare hashed password from the database object and return data accordingly
            bcrypt.compare(password, user.password, (error, result) => {
                if(result == false) {
                    reject();
                } else {
                    resolve(user);
                }
            });
        });
    });
}

UserSchema.methods.removeToken = function(token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};
UserSchema.statics.getItemsByUserId = function(id) {
    var User = this;
    return useritems = UserTransaction.find({
            "user_id":id,
            "transaction_type":"items_purchased_using_points"
        }).then((usertransactions) => {
        if(!usertransactions) {
            return Promise.reject();
        }
        // return usertransactions;
        return new Promise((resolve, reject) => {
            resolve(usertransactions);
        });
    });
}

var User = mongoose.model('User', UserSchema);

module.exports = {User};
