var express = require("express");
var router = express.Router();
var md5 = require("md5");
var async = require("async");
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
var appRoot = require("app-root-path");
appRoot = appRoot.toString();
var categoriesModel = require("../../models/category");
var asliasModel = require("../../models/aliasurl");
var productModel = require("../../models/product");
let checkAdmin = require("../../common/helper");

function bodauTiengViet(str) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/ /g, "-");
  str = str.replace(/\./g, "-");
  return str;
}

function aliasUrl(str) {
  // Chuyển hết sang chữ thường
  str = str.toLowerCase();
  // xóa dấu
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, '');

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, '-');

  // xóa phần dự - ở đầu
  str = str.replace(/^-+/g, '');

  // xóa phần dư - ở cuối
  str = str.replace(/-+$/g, '');

  // return
  return str;
}


function aliasUrl(str) {
  // Chuyển hết sang chữ thường
  str = str.toLowerCase();
  // xóa dấu
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
  str = str.replace(/(đ)/g, "d");

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, "");

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, "-");

  // xóa phần dự - ở đầu
  str = str.replace(/^-+/g, "");

  // xóa phần dư - ở cuối
  str = str.replace(/-+$/g, "");

  // return
  return str;
}

function makeid() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
router.get("/categories", checkAdmin, async (req, res) => {
  let data = await categoriesModel
    .aggregate([{
      $graphLookup: {
        from: "category",
        startWith: "$categoryParent",
        connectFromField: "categoryParent",
        connectToField: "_id",
        as: "parents"
      }
    }])
    .exec();

  res.render("backend/categories", {
    data
  });
});

router.get("/categories/add", checkAdmin, async (req, res) => {
  let categoriesData = new categoriesModel({});
  let categories = await categoriesModel
    .find({
      parentId: null
    })
    .exec();

  res.render("backend/categories/add", {
    categoriesData,
    categories
  });
});

router.post("/categories/add", checkAdmin, async (req, res) => {
  req.checkBody("code", "Giá trị Mã không được để trống").notEmpty();
  req.checkBody("name", "Giá trị Tên không được để trống").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/admin/categories/add");
  }

  //kiểm tra alias đã tồn tại hay chưa
  let checkAlias = await asliasModel.findOne({
    $or: [{
      aliasUrl: aliasUrl(req.body.name)
    }, {
      code: req.body.code
    }]
  }).exec();

  if (checkAlias) {
    req.flash("error_msg", "Danh mục đã tồn tại");
    return res.redirect("/admin/categories/add");
  }

  //kiểm tra category đã tồn tại tên này hay chưa
  let checkCategories = await categoriesModel.findOne({
    $or: [{
        aliasUrl: aliasUrl(req.body.name)
      },
      {
        code: req.body.code
      }
    ]
  }).exec();

  if (checkCategories) {
    req.flash("error_msg", "Danh mục đã tồn tại");
    return res.redirect("/admin/categories/add");
  }

  var cateParent = null;
  if (req.body.cate != 0) {
    cateParent = req.body.cate;
  }

  var Cate = new categoriesModel({
    code: req.body.code,
    nameCategory: req.body.name,
    aliasUrl: aliasUrl(req.body.name),
    categoryParent: cateParent,
    categoryIdChildren: 0,
    dateCreate: Date.now(),
    dateUpdate: Date.now(),
    status: req.body.statusradio
  });

  Cate.save().then(function (idCate) {
    console.log(idCate);
    var AliasU = new asliasModel({
      aliasUrl: aliasUrl(req.body.name),
      type: "category",
      idParent: idCate._id,
      status: 1
    });
    AliasU.save().then(() => {
      req.flash("success_msg", "Đã Thêm Thành Công");
      return res.redirect("/admin/categories");
    });
  });

});

router.get("/categories/edit/:id", checkAdmin, async (req, res, next) => {
  let categoriesData = await categoriesModel.findById(
    req.params.id
  ).exec();

  let categories = await categoriesModel.find({
    categoryParent: null,
    _id: {
      $ne: req.params.id
    }
  }).exec();
  res.render("backend/categories/add", {
    errors: null,
    categoriesData,
    categories
  });
});
router.post("/categories/edit/:id", checkAdmin, async (req, res, next) => {
  let id = req.params.id;
  req.checkBody("code", "Giá Trị Mã không được để trống").notEmpty();
  req.checkBody("name", "Giá Trị Tên không được để trống").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors);
    return res.redirect("/admin/categories/edit/" + id);
  }

  let dataOne = await categoriesModel.findById(id).exec();

  let dataCheck = await categoriesModel.findOne({
    $and: [{
      $or: [{
          $and: [{
            aliasUrl: aliasUrl(req.body.name)
          }]
        },
        {
          code: req.body.code
        }
      ]
    }, {
      _id: {
        $ne: id
      }
    }]
  }).exec();

  if (dataCheck) {
    req.flash("error_msg", "Danh mục đã tồn tại.");
    return res.redirect("/admin/categories/edit/" + id);
  }
  var cateParent = null;
  if (req.body.categoryParent !== 0) {
    cateParent = req.body.categoryParent;
  }
  dataOne.code = req.body.code;
  dataOne.nameCategory = req.body.name;
  dataOne.aliasUrl = aliasUrl(req.body.name);
  dataOne.categoryParent = cateParent;
  dataOne.status = req.body.status;
  dataOne.dateUpdate = Date.now();
  dataOne.save().then(() => {
    req.flash("success_msg", "Đã Sửa Thành Công");
    res.redirect("/admin/categories/edit/" + id);
  });

});

/// Delete one or multi product search
router.post("/categories/del", checkAdmin, multipartMiddleware, (req, res) => {
  try {
    var arrId = req.body;
    (async () => {
      arrId.forEach(async item => {
        console.log(item);
        let dataCheck = await productModel
          .findOne({
            categoryID: item
          })
          .exec();
        console.log(dataCheck);
        if (!dataCheck) {
          let dataCategories = await categoriesModel.findById(item);
          if (dataCategories) {
            categoriesModel
              .findById(item)
              .deleteOne()
              .then(() => {
                console.log("Deleted: " + item);
              });
          }
        } else {
          console.log("san pham da co san pham.");
        }
      });
    })();

    return res.json({
      status: true,
      msg: "Success"
    });
  } catch (error) {
    return res.json({
      status: false,
      msg: error + ""
    });
  }
});

module.exports = router;