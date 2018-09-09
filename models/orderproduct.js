var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var orderProduct = new Schema({
    name: String,
    email: String,
    phoneNumber: Number,
    image: String,
    content: String,
    Notes: String,
    dateCreate: Date,
    status: Boolean

}, { collection: 'orderproduct' });

module.exports = mongoose.model('orderproduct', orderProduct);