// var mongoose = require('mongoose');
// let infoshopSchema = mongoose.Schema({
//     id: String,
//     nameShop: String,
//     title: String,
//     description: String,
//     email: String,
//     phoneNumber: String,
//     hotLine: String,
//     logo: String,
//     status: Number,
// });
// let InfoShopData = module.exports = mongoose.model('infoshop', infoshopSchema);

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