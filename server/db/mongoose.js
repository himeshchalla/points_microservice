const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true,
}).then(
    (result) => { console.log('Database Connected successfully'); },
    (err) => { console.log('Unable to connect to the database'); }
);

module.exports = {
    mongoose: mongoose
}
