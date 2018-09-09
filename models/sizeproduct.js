// var mongoose = require('mongoose');

// let sizeProductSchema = mongoose.Schema({
//     id: String,
//     idProduct: String,
//     nameProduct: String,
//     nameSize: String,
//     priceSize: String,
//     status: Number
// });

// let SizeProduct = module.exports = mongoose.model('sizeproduct', sizeProductSchema);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
mongoose.Promise = global.Promise;

var sizeProductSchema = new Schema({
    idProduct: ObjectId,
    sizeLength: Number,
    sizeWidth: Number,
    sizeHeight: Number,
    priceProduct: Number,
    status: Boolean

}, { collection: 'sizeproduct' });

module.exports = mongoose.model('sizeproduct', sizeProductSchema);