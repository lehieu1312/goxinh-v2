var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var bannerModel = require("../../models/banner");
let checkAdmin = require("../../common/helper");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload/banner");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

var upload = multer({
  storage: storage
});

router.get("/banner", checkAdmin,async  (req, res) => {
  let data = await bannerModel.find().exec(); 
    res.render("backend/banner/index", {
      data: data
    });
});

router.get("/banner/add", checkAdmin, async (req, res) => {
  let data = new bannerModel({});
    res.render("backend/banner/add", {data});
});

router.post("/banner/add", checkAdmin, upload.single("image"), (req, res) => {
  if (req.file == null) {
    req.flash("error_msg", "Image không được để trống");
    res.redirect("/admin/banner/add");
  }
  req.checkBody("nameBanner", 'Giá Trị "Tên" không được để trống').notEmpty();
  req.checkBody("numberOrder", 'Giá Trị "Thứ tự" phải là số').isInt();

  var errors = req.validationErrors();
  if (errors) {
    var file = "./public/upload/" + req.file.filename;
    fs.unlinkSync(file);
   return res.render("admin/banner/add", {
      errors: errors
    });
  } else {
    var ban = new bannerModel({
      nameBanner: req.body.nameBanner,
      linkBanner: req.body.linkBanner,
      imageBanner: req.file.filename,
      locationBanner: req.body.locationBanner,
      numberOrder: req.body.numberOrder,
      status: req.body.status
    });

    ban.save().then(function () {
      req.flash("success_msg", "Đã Thêm Thành Công");
      res.redirect("/admin/banner");
    });
  }
});
router.get("/banner/edit/:id", checkAdmin, async  (req, res, next)=> {
  let data = await bannerModel.findById(req.params.id);
    res.render("backend/banner/add", {
      errors: null,
      data
    });
});
router.post("/edit/:id", checkAdmin, upload.single("hinh"), function (
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
    BannerModel.findById({
      _id: req.params.id
    }, function (err, data) {
      if (err) {
        console.log(err);
        req.flash("error_msg", "Lỗi triết xuất dữ liệu");
        return res.redirect("/admin/banner/list.html");
      }
      res.render("admin/banner/edit", {
        errors: errors,
        data: data
      });
    });
    // res.render('admin/banner/edit', { errors: errors });
  } else {
    // console.log(req.file);
    // if (req.file != null) {
    //     upload.single('hinh');
    // }
    BannerModel.findById({
      _id: req.params.id
    }, function (err, dataBanner) {
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
router.get("/del/:id", checkAdmin, function (req, res) {
  try {
    BannerModel.findById(req.params.id, function (err, data) {
      var file = "./public/upload/" + data.imageBanner;
      fs.unlink(file, function (e) {
        if (e) throw e;
      });
      data.remove(function () {
        req.flash("success_msg", "Đã Xoá Thành Công");
        res.redirect("/admin/banner/list.html");
      });
    });
  } catch (error) {
    req.flash("error_msg", "Xoá Không Thành Công: " + error + "");
    res.redirect("/admin/banner/list.html");
  }
});

module.exports = router;