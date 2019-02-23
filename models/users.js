
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var userSchema = new Schema({
    id: String,
    fullName: String,
    email: String,
    password: String,
    phoneNumber: String,
    isAdmin: Boolean,
    avatar: String,
    status: Boolean

}, {
    collection: 'users'
});

module.exports = mongoose.model('users', userSchema);