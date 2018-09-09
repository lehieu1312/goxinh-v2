var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var newsSchema = new Schema({
    nameNews: String,
    aliasUrl: String,
    titleNews: String,
    descriptionNews: String,
    detailNews: String,
    typeNews: Number,
    dateCreate: Date,
    status: Boolean
}, { collection: 'news' });

module.exports = mongoose.model('news', newsSchema);