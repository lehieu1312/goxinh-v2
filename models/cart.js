// var mongoose = require('mongoose');

// let cartSchema = mongoose.Schema({
//     id: String,
//     codeCart: String,
//     fullName: String,
//     email: String,
//     phoneNumber: String,
//     address: String,
//     idProduct: String,
//     nameProduct: String,
//     qualyti: Number,
//     price: Number,
//     totalMoney: Number,
//     noteCart: String,
//     dateCreate: String,
//     status: Number
// });
// let CartData = module.exports = mongoose.model('cart', cartSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var aliasUrlSchema = new Schema({
    id: String,
    alias: String,
    type: String,
    idCha: String,
    status: Boolean

}, { collection: 'aliasurl' });

module.exports = mongoose.model('aliasurl', aliasUrlSchema);