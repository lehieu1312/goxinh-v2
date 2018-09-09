var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var BannerModel = require("../../models/banner");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/upload");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

var upload = multer({ storage: storage });

router.get("/list.html", checkAdmin, (req, res) => {
  // console.log('1');
  // let data = await Category.find({}).exec();
  BannerModel.find().then(data => {
    console.log(data);
    res.render("admin/banner/list", { data: data });
  });
});
router.get("/add.html", checkAdmin, (req, res) => {
  BannerModel.find({}).then(result => {
    res.render("admin/banner/add", { errors: null });
  });
});
router.post("/add.html", checkAdmin, upload.single("hinh"), (req, res) => {
  console.log(req.file);
  if (req.file == null) {
    req.flash("error_msg", "Image không được để trống");
    res.redirect("/admin/banner/add.html");
  }
  req.checkBody("name", 'Giá Trị "Tên" không được để trống').notEmpty();
  req.checkBody("title", 'Giá Trị "Tiêu đề" không được để trống').notEmpty();
  req
    .checkBody("numberorder", 'Giá Trị "Thứ tự" không được để trống')
    .notEmpty();
  // req.checkBody('hinh', 'Giá Trị "hinh" không được rổng').notEmpty();

  // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
  var errors = req.validationErrors();
  if (errors) {
    var file = "./public/upload/" + req.file.filename;
    fs.unlink(file, function(e) {
      if (e) throw e;
    });
    res.render("admin/banner/add", { errors: errors });
  } else {
    console.log(req.body.location);
    console.log(req.body.statusradio);

    var ban = new BannerModel({
      nameBanner: req.body.name,
      titleBanner: req.body.title,
      linkBanner: req.body.link,
      imageBanner: req.file.filename,
      locationBanner: req.body.location,
      numberOrder: req.body.numberorder,
      status: req.body.statusradio
    });

    ban.save().then(function() {
      req.flash("success_msg", "Đã Thêm Thành Công");
      res.redirect("/admin/banner/list.html");
    });
  }
});
router.get("/edit/:id", checkAdmin, function(req, res, next) {
  BannerModel.findById({ _id: req.params.id }, function(err, data) {
    if (err) {
      console.log(err);
      req.flash("error_msg", "Lỗi triết xuất dữ liệu");
      return res.redirect("/admin/banner/list.html");
    }
    res.render("admin/banner/edit", { errors: null, data: data });
  });
});
router.post("/edit/:id", checkAdmin, upload.single("hinh"), function(
  req,
  res,
  next
) {
  console.log(req.body.name);
  req.checkBody("name", 'Giá Trị "Tên" không được để trống').notEmpty();
  req.checkBody("title", 'Giá Trị "Tiêu đề" không được để trống').notEmpty();
  req
    .checkBody("numberorder", 'Giá Trị "Thứ tự" không được để trống')
    .notEmpty();
  // req.checkBody('hinh', 'Giá Trị "hinh" không được rổng').notEmpty();

  // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
  var errors = req.validationErrors();
  console.log(errors);
  if (errors) {
    BannerModel.findById({ _id: req.params.id }, function(err, data) {
      if (err) {
        console.log(err);
        req.flash("error_msg", "Lỗi triết xuất dữ liệu");
        return res.redirect("/admin/banner/list.html");
      }
      res.render("admin/banner/edit", { errors: errors, data: data });
    });
    // res.render('admin/banner/edit', { errors: errors });
  } else {
    // console.log(req.file);
    // if (req.file != null) {
    //     upload.single('hinh');
    // }
    BannerModel.findById({ _id: req.params.id }, function(err, dataBanner) {
      if (err) {
        console.log(err);
        req.flash("error_msg", "Error find Database");
        return res.redirect("/admin/banner/edit/" + req.params.id);
      }
      if (req.file != null) {
        var file = path.join(
          __dirname,
          "public",
          "upload",
          dataBanner.imageBanner
        );
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      dataBanner.nameBanner = req.body.name;
      dataBanner.titleBanner = req.body.title;
      dataBanner.linkBanner = req.body.link;
      if (req.file != null) {
        dataBanner.imageBanner = req.file.filename;
      }
      dataBanner.locationBanner = req.body.location;
      dataBanner.numberOrder = req.body.numberorder;
      dataBanner.status = req.body.statusradio;
      dataBanner.save();
      req.flash("success_msg", "Đã Sửa Thành Công");
      res.redirect("/admin/banner/list.html");
    });
  }
});
router.get("/del/:id", checkAdmin, function(req, res) {
  // Product.findById(req.params.id).remove(function() {
  // 	console.log(daa);
  // 	req.flash('success_msg', 'Đã Xoá Thành Công');
  // 	res.redirect('/admin/product/danh-sach.html');
  // });
  try {
    BannerModel.findById(req.params.id, function(err, data) {
      var file = "./public/upload/" + data.imageBanner;
      fs.unlink(file, function(e) {
        if (e) throw e;
      });
      data.remove(function() {
        req.flash("success_msg", "Đã Xoá Thành Công");
        res.redirect("/admin/banner/list.html");
      });
    });
  } catch (error) {
    req.flash("error_msg", "Xoá Không Thành Công: " + error + "");
    res.redirect("/admin/banner/list.html");
  }
});

function checkAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/admin/dang-nhap.html");
  }
}
module.exports = router;
