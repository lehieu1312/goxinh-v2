var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var ObjectId = Schema.ObjectId;
var categorySchema = new Schema(
  {
    id: Number,
    code: String,
    nameCategory: String,
    aliasUrl: String,
    categoryParent: ObjectId,
    categoryIdChildren: Number,
    numberOrder: Number,
    dateCreate: Date,
    dateUpdate: Date,
    status: Boolean
  },
  { collection: "category" }
);

module.exports = mongoose.model("category", categorySchema);
