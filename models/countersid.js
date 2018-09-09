var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var countersSchema = new Schema({
    id: Number,
    type: String,
    value: Number
}, { collection: 'countersid' });

module.exports = mongoose.model('counters', countersSchema);