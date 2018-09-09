var express = require("express");
var router = express.Router();
var md5 = require("md5");
var async = require("async");
var Category = require("../../models/category");
var CountersID = require("../../models/countersid");
var AliasUrL = require("../../models/aliasurl");
var ProductModel = require("../../models/product");

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

function makeid() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
router.get("/list.html", checkAdmin, (req, res) => {
  Category.find()
    .sort({ dateCreate: -1, dateUpdate: -1 })
    .then(data => {
      res.render("admin/category/list", { data: data });
    });
});
router.get("/add.html", checkAdmin, (req, res) => {
  Category.find({ categoryParent: null }).then(result => {
    res.render("admin/category/add", { errors: null, CategoryList: result });
  });
});
router.post("/add.html", checkAdmin, (req, res) => {
  req.checkBody("code", "Giá trị Mã không được để trống").notEmpty();
  req.checkBody("name", "Giá trị Tên không được để trống").notEmpty();
  req.checkBody("name", "Name 5 đến 32 ký tự").isLength({ min: 3, max: 32 });
  var errors = req.validationErrors();
  if (errors) {
    return res.render("admin/category/add.html", { errors: errors });
  }
  //kiểm tra alias đã tồn tại hay chưa
  AliasUrL.findOne({
    $or: [{ aliasUrl: bodauTiengViet(req.body.name) }, { code: req.body.code }]
  }).exec((error, kq) => {
    if (error) {
      req.flash("error_msg", error + "");
      return res.redirect("/admin/category/add.html");
    }
    console.log(kq);
    if (kq) {
      req.flash("error_msg", "Danh mục đã tồn tại.");
      return res.redirect("/admin/category/add.html");
    }
    //kiểm tra category đã tồn tại tên này hay chưa
    Category.findOne({
      $or: [
        { aliasUrl: bodauTiengViet(req.body.name) },
        { code: req.body.code }
      ]
    }).exec((err, result) => {
      if (err) {
        console.log(err);
        req.flash("error_msg", "Error Find Database");
        return res.redirect("/admin/category/add.html");
      }
      if (result) {
        console.log("Đã tồn tại");
        req.flash("error_msg", "Danh mục đã tồn tại");
        return res.redirect("/admin/category/add.html");
        // return req.flash('error_msg', 'Danh mục đã tồn tại!');
        // return done(null, false, { error_msg: 'Danh mục đã tồn tại!' });
      } else {
        console.log("check xong!");
        console.log("cate: " + req.body.cate);
        var cateParent = null;
        if (req.body.cate != 0) {
          cateParent = req.body.cate;
        }
        var Cate = new Category({
          code: req.body.code,
          nameCategory: req.body.name,
          aliasUrl: bodauTiengViet(req.body.name),
          categoryParent: cateParent,
          categoryIdChildren: 0,
          dateCreate: Date.now(),
          dateUpdate: Date.now(),
          status: req.body.statusradio
        });

        Cate.save().then(function(idCate) {
          console.log(idCate);
          var AliasU = new AliasUrL({
            aliasUrl: bodauTiengViet(req.body.name),
            type: "category",
            idParent: idCate._id,
            status: 1
          });
          AliasU.save().then(() => {
            req.flash("success_msg", "Đã Thêm Thành Công");
            return res.redirect("/admin/category/list.html");
          });
        });
      }
    });
  });
});

router.get("/edit/:id", checkAdmin, function(req, res, next) {
  Category.findOne({ _id: req.params.id }, function(err, data) {
    if (err) {
      console.log(err);
      req.flash("error_msg", "Lỗi triết xuất dữ liệu");
      return res.redirect("/admin/category/list.html");
    }
    console.log("data: " + data);
    Category.find({
      categoryParent: null,
      _id: { $nin: [req.params.id] }
    }).exec((err, result) => {
      if (err) {
        console.log(err);
        req.flash("error_msg", "Lỗi triết xuất dữ liệu");
        return res.redirect("/admin/category/list.html");
      }
      console.log("result: " + result);
      res.render("admin/category/edit", {
        errors: null,
        data: data,
        CategoryList: result
      });
    });
  });
});
router.post("/edit/:id", checkAdmin, function(req, res, next) {
  req.checkBody("code", "Giá Trị Mã không được để trống").notEmpty();
  req.checkBody("name", "Giá Trị Tên không được để trống").notEmpty();
  req.checkBody("name", "Name 5 đến 32 ký tự").isLength({ min: 3, max: 32 });
  var errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    // req.flash("error", errors);
    req.flash("error", errors);
    return res.redirect("/admin/category/edit/" + req.params.id);
  } else {
    Category.findOne({ _id: req.params.id }, function(err, dataCate) {
      if (err) {
        console.log(err);
        req.flash("error_msg", "Error find Database");
        return res.redirect("/admin/category/edit/" + req.params.id);
      }
      Category.findOne({
        $or: [
          {
            $and: [
              { aliasUrl: bodauTiengViet(req.body.name) },
              { aliasUrl: { $ne: dataCate.aliasUrl } }
            ]
          },
          { code: req.body.code }
        ]
      }).exec((error, kq) => {
        if (error) {
          req.flash("error_msg", error + "");
          return res.redirect("/admin/category/edit/" + req.params.id);
        }
        console.log(kq);
        if (kq) {
          req.flash("error_msg", "Danh mục đã tồn tại.");
          return res.redirect("/admin/category/edit/" + req.params.id);
        }
        var cateParent = null;
        if (req.body.cate != 0) {
          cateParent = req.body.cate;
        }
        console.log(dataCate);
        dataCate.code = req.body.code;
        dataCate.nameCategory = req.body.name;
        dataCate.aliasUrl = bodauTiengViet(req.body.name);
        dataCate.categoryParent = cateParent;
        dataCate.status = req.body.statusradio;
        dateUpdate: Date.now();
        dataCate.save().then(() => {
          AliasUrL.findOne({ idParent: req.params.id }, function(err, result) {
            if (err) {
              console.log(err);
              req.flash("error_msg", "Error find Database");
              return res.redirect("/admin/category/edit/" + req.params.id);
            }
            result.aliasUrl = bodauTiengViet(req.body.name);
            result.save().then(() => {
              req.flash("success_msg", "Đã Sửa Thành Công");
              res.redirect("/admin/category/list.html");
            });
          });
        });
      });
    });
  }
});

router.get("/del/:id", checkAdmin, function(req, res, next) {
  ProductModel.findOne({ categoryID: req.params.id }).then(data => {
    console.log(data);
    if (data) {
      req.flash(
        "error_msg",
        "Bạn đã không thể xóa danh mục này,vì đã có sản phẩm thuộc danh mục."
      );
      return res.redirect("/admin/category/list.html");
    }
    Category.findOne({ _id: req.params.id }).remove(function() {
      AliasUrL.findOne({
        idParent: req.params.id,
        type: "category"
      }).remove(err => {
        if (err) {
          console.log(err + "");
          req.flash("error_msg", "Xóa lỗi " + err + "");
          return res.redirect("/admin/category/list.html");
        }
        req.flash("success_msg", "Đã Xoá Thành Công");
        res.redirect("/admin/category/list.html");
      });
    });
  });
});

function checkAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/admin/dang-nhap.html");
  }
}
module.exports = router;
