// var mongoose = require('mongoose');

// let userSchema = mongoose.Schema({
//     id: String,
//     fullName: String,
//     email: String,
//     password: String,
//     phoneNumber: String,
//     avatar: String,
//     status: Number
// });

// let User = module.exports = mongoose.model('user', userSchema);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var userSchema = new Schema({
    id: String,
    fullName: String,
    email: String,
    password: String,
    phoneNumber: String,
    avatar: String,
    status: Boolean

}, { collection: 'users' });

module.exports = mongoose.model('users', userSchema);