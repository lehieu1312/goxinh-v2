var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var ObjectId = Schema.ObjectId;
var aliasUrlSchema = new Schema({
    id: Number,
    aliasUrl: String,
    type: String,
    idParent: ObjectId,
    status: Boolean

}, { collection: 'aliasurl' });

module.exports = mongoose.model('aliasurl', aliasUrlSchema);