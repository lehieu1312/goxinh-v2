var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
mongoose.Promise = global.Promise;

var orderProduct = new Schema({
    name: String,
    email: String,
    phoneNumber: Number,
    address: String,
    notes: String,
    cartProduct: Array,
    summaryMoney: Number,
    idSizeProduct: ObjectId,
    idProductSync: Array,
    quanlity: Number,
    dateCreate: Date,
    statusOrder: Number,
    status: Boolean

}, { collection: 'orderbuyproduct' });
// {
//     idProduct: ObjectId,
//     idSize: ObjectId,
//     price: Number,
//     quanlity: Number,
// },
module.exports = mongoose.model('orderbuyproduct', orderProduct);