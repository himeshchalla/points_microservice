var {User} = require('./../model/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    User.findByToken(token).then((user) => {
        if(!user) {
            console.log('User not found');
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((err) => {
        console.log('Issue in user request as auth is required:'+err);
        res.status(401).send();
    });
}

module.exports = {authenticate}
