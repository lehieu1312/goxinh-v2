var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var bannerModel = require("../../models/banner");
let checkAdmin = require("../../common/helper");
var appRoot = require('app-root-path');
appRoot = appRoot.toString();
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload");
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
router.post("/banner/edit/:id", checkAdmin, upload.single("image"), async (req,res,next) => {
  let id = req.params.id;
  req.checkBody("nameBanner", 'Giá Trị "Tên" không được để trống').notEmpty();
  req.checkBody("numberOrder", 'Giá Trị "Thứ tự" không được để trống').notEmpty();

  var errors = req.validationErrors();
  console.log(errors);
  if (errors) {
    let data= await bannerModel.findById(id).exec();
      res.render("admin/banner/edit", {
        errors: errors,
        data: data
      });
  } else {
   let dataBanner = await bannerModel.findById(id).exec();
      if (req.file != null) {
        var file = path.join(
          __dirname,
          "public",
          "upload",
          dataBanner.imageBanner
        );
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      dataBanner.nameBanner = req.body.nameBanner;
      dataBanner.linkBanner = req.body.linkBanner;
      if (req.file != null) {
        dataBanner.imageBanner = req.file.filename;
      }
      dataBanner.locationBanner = req.body.locationBanner;
      dataBanner.numberOrder = req.body.numberOrder;
      dataBanner.status = req.body.status;
      dataBanner.save();
      req.flash("success_msg", "Đã Sửa Thành Công");
      res.redirect("/admin/banner");
  }
});
router.post("/banner/del", checkAdmin, function (req, res) {
  try {
        var arrId = req.body;
        (async () => {
            arrId.forEach(async item => {
                let data = await bannerModel.findById(item);
                if (data) {
                    var file = path.join(appRoot, 'public', 'upload', data.imageBanner);
                    if(fs.existsSync(file))
                      fs.unlinkSync(file);
                    bannerModel.findById(item).deleteOne()
                        .then(() => {
                            console.log("Deleted: " + item);
                        });
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