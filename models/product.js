var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var ObjectId = Schema.ObjectId;
var productSchema = new Schema(
  {
    id: String,
    nameProduct: String,
    codeProduct: String,
    unitProduct: String,
    aliasUrl: String,
    description: String,
    priceProduct: Number,
    detailProduct: String,
    imageProduct: String,
    imageOne: String,
    imageTwo: String,
    imageThree: String,
    imageFour: String,
    imageFive: String,
    dateCreate: Date,
    productSync: Boolean,
    productIDSync: ObjectId,
    categoryID: ObjectId,
    viewCounter: Number,
    search: String,
    status: Boolean
  },
  { collection: "product" }
);

module.exports = mongoose.model("product", productSchema);
