
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var bannerSchema = new Schema({
    id: Number,
    nameBanner: String,
    titleBanner: String,
    linkBanner: String,
    imageBanner: String,
    locationBanner: Number,
    numberOrder: Number,
    status: Boolean

}, { collection: 'banners' });

module.exports = mongoose.model('banner', bannerSchema);