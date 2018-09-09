// var mongoose = require('mongoose');

// let menuSchema = mongoose.Schema({
//     id: String,
//     name: String
// });

// let MenuData = module.exports = mongoose.model('menu', menuSchema);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var aliasUrlSchema = new Schema({
    id: String,
    nameMenu: String,
    alias: String,
    type: String,
    idCha: String,
    status: Boolean

}, { collection: 'aliasurl' });

module.exports = mongoose.model('aliasurl', aliasUrlSchema);