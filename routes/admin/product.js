var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({
  extended: false
});
var md5 = require("md5");
var path = require("path");
var fs = require("fs");
var appRoot = require("app-root-path");
appRoot = appRoot.toString();
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
var XLSX = require("xlsx");
var ProductModel = require("../../models/product");
var sizeProductModel = require("../../models/sizeproduct");
var CategoryModel = require("../../models/category");
var AliasUrlModel = require("../../models/aliasurl");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload/product");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

var upload = multer({
  storage: storage
}).single("imageproduct");

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

function makename() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 20; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.get("/list.html", checkAdmin, function (req, res) {
  try {
    console.log('vao ham');
    ProductModel.aggregate(
      [{
        $lookup: {
          from: "category", // other table name
          localField: "categoryID", // name of users table field
          foreignField: "_id", // name of userinfo table field
          as: "cateProduct" // alias for userinfo table
        }
      }]
    ).sort({
      codeProduct: -1
    }).then(pro => {
      console.log(pro);
      res.render("admin/product/list", {
        product: pro
      });
    });
  } catch (error) {
    console.log(error)
  }

});

router.get("/add.html", checkAdmin, (req, res) => {
  ProductModel.find().then(proData => {
    CategoryModel.find().then(data => {
      res.render("admin/product/add", {
        cateData: data,
        productData: proData,
        errors: null
      });
    });
  });
});
router.post("/add.html", checkAdmin, multipartMiddleware, function (
  req,
  res,
  next
) {
  try {
    // upload.single('imageproduct');
    // upload(req, res, function(err) {
    //     if (err) {
    //         console.log('0: ' + err);
    //         req.flash('error_msg', err + '');
    //         return res.redirect('/admin/product/add.html');
    //     }
    // });

    // console.log(req.body);
    // console.log(req.files);
    // console.log(req.body.name);
    req.checkBody("name", "Tên sản phẩm không được để trống").notEmpty();
    req.checkBody("code", "Mã sản phẩm không được để trống").notEmpty();
    req
      .checkBody("code", "Mã sản phẩm phải có từ 3 đến 32 ký tự")
      .isLength({
        min: 3,
        max: 32
      });
    req.checkBody("unit", "Đơn vị sản phẩm không được để trống").notEmpty();
    // req.checkBody('unit', 'Mã sản phẩm phải có từ 3 đến 32 ký tự').isLength({ min: 3, max: 32 });
    req.checkBody("detail", "Chi tiết sản phẩm không được để trống").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      // req.flash('errors', errors);
      ProductModel.find().then(proData => {
        CategoryModel.find().then(data => {
          return res.render("admin/product/add", {
            cateData: data,
            productData: proData,
            errors: errors
          });
        });
      });
      // return res.render('admin/product/add', { errors: errors });
    } else {
      var imageProduct = req.files.imageproduct;

      var imageOne = req.files.imageone;

      var imageTwo = req.files.imagetwo;

      var imageThree = req.files.imagethree;

      var imageFour = req.files.imagefour;

      var imageFive = req.files.imagefive;
      // console.log("imageFive: " + JSON.stringify(imageFive));

      AliasUrlModel.findOne({
        aliasUrl: bodauTiengViet(req.body.name + " " + req.body.code)
      }).exec((err, result) => {
        if (err) {
          req.flash("error_msg", err + "");
          return res.redirect("/admin/product/add.html");
        }

        if (result != null) {
          // console.log('length: ' + result.length);
          // if (result.length > 0) {

          req.flash("error_msg", "Url đã tồn tại.");
          return res.redirect("/admin/product/add.html");
          // }
        } else {
          var pathUpload = path.join(appRoot, "public", "upload", "product");

          var nameImageProduct = makename(),
            fullNameImageProduct = "",
            nameImageOne = makename(),
            fullNameImageOne = "",
            nameImageTwo = makename(),
            fullNameImageTwo = "",
            nameImageThree = makename(),
            fullNameImageThree = "",
            nameImageFour = makename(),
            fullNameImageFour = "",
            nameImageFive = makename(),
            fullNameImageFive = "";
          if (
            typeof imageProduct != "undefined" &&
            imageProduct.originalFilename != ""
          ) {
            var extFile = imageProduct.originalFilename.split(".").pop();

            fullNameImageProduct = nameImageProduct + "." + extFile;
            var dataImageProduct = fs.readFileSync(imageProduct.path);
            fs.writeFileSync(
              path.join(pathUpload, fullNameImageProduct),
              dataImageProduct
            );
          }
          if (
            typeof imageOne != "undefined" &&
            imageOne.originalFilename != ""
          ) {
            var extFile = imageOne.originalFilename.split(".").pop();
            // nameImageOne = imageOne.originalFilename;
            fullNameImageOne = nameImageOne + "." + extFile;
            var dataImageOne = fs.readFileSync(imageOne.path);
            fs.writeFileSync(
              path.join(pathUpload, fullNameImageOne),
              dataImageOne
            );
          }
          if (
            typeof imageTwo != "undefined" &&
            imageTwo.originalFilename != ""
          ) {
            var extFile = imageTwo.originalFilename.split(".").pop();
            // nameImageOne = imageOne.originalFilename;
            fullNameImageTwo = nameImageTwo + "." + extFile;
            var dataImageTwo = fs.readFileSync(imageTwo.path);
            fs.writeFileSync(
              path.join(pathUpload, fullNameImageTwo),
              dataImageTwo
            );
          }
          if (
            typeof imageThree != "undefined" &&
            imageThree.originalFilename != ""
          ) {
            var extFile = imageThree.originalFilename.split(".").pop();
            // nameImageOne = imageOne.originalFilename;
            fullNameImageThree = nameImageThree + "." + extFile;
            var dataImageThree = fs.readFileSync(imageThree.path);
            console.log("dataImageThree: " + dataImageThree);
            fs.writeFileSync(
              path.join(pathUpload, fullNameImageThree),
              dataImageThree
            );
          }
          if (
            typeof imageFour != "undefined" &&
            imageFour.originalFilename != ""
          ) {
            console.log("5");
            var extFile = imageFour.originalFilename.split(".").pop();
            // nameImageOne = imageOne.originalFilename;
            fullNameImageFour = nameImageFour + "." + extFile;
            var dataImageFour = fs.readFileSync(imageFour.path);
            fs.writeFileSync(
              path.join(pathUpload, fullNameImageFour),
              dataImageFour
            );
          }
          if (
            typeof imageFive != "undefined" &&
            imageFive.originalFilename != ""
          ) {
            console.log("6");
            var extFile = imageFive.originalFilename.split(".").pop();
            // nameImageOne = imageOne.originalFilename;
            fullNameImageFive = nameImageFive + "." + extFile;
            var dataImageFive = fs.readFileSync(imageFive.path);
            fs.writeFileSync(
              path.join(pathUpload, fullNameImageFive),
              dataImageFive
            );
          }
          console.log("===end upload===");
          console.log("cate: " + req.body.cate);
          var proIDAsync = null;
          if (req.body.productidasync != 0) {
            proIDAsync = req.body.productidasync;
          }
          console.log(req.body.detail);
          var Products = new ProductModel({
            nameProduct: req.body.name,
            codeProduct: req.body.code,
            unitProduct: req.body.unit,
            aliasUrl: bodauTiengViet(req.body.name + " " + req.body.code),
            description: req.body.description,
            detailProduct: req.body.detail,
            imageProduct: fullNameImageProduct,
            imageOne: fullNameImageOne,
            imageTwo: fullNameImageTwo,
            imageThree: fullNameImageThree,
            imageFour: fullNameImageFour,
            imageFive: fullNameImageFive,
            priceProduct: req.body.price,
            productSync: req.body.productasync,
            productIDSync: proIDAsync,
            categoryID: req.body.category,
            search: bodauTiengViet(
              nameProduct +
              " " +
              codeProduct +
              " " +
              unitProduct +
              " " +
              description +
              " " +
              detailProduct
            ),
            status: req.body.statusradio
          });

          Products.save().then(function (idP) {
            console.log("idP: " + idP);
            var AliasU = new AliasUrlModel({
              aliasUrl: bodauTiengViet(req.body.name + " " + req.body.code),
              type: "product",
              idParent: idP._id,
              status: 1
            });
            AliasU.save().then(() => {
              console.log("success");
              req.flash("success_msg", "Đã Thêm Thành Công");
              return res.redirect("/admin/product/list.html");
            });
          });
        }
      });
    }
  } catch (error) {
    console.log("All: " + error + "");
    var pathUpload = path.join(appRoot, "public", "upload", "product");
    if (fs.existsSync(path.join(pathUpload, req.files.imageproduct)))
      fs.unlinkSync(path.join(pathUpload, req.files.imageproduct));
    if (fs.existsSync(path.join(pathUpload, req.files.imageone)))
      fs.unlinkSync(path.join(pathUpload, req.files.imageone));
    if (fs.existsSync(path.join(pathUpload, req.files.imagetwo)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagetwo));
    if (fs.existsSync(path.join(pathUpload, req.files.imagethree)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagethree));
    if (fs.existsSync(path.join(pathUpload, req.files.imagefour)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagefour));
    if (fs.existsSync(path.join(pathUpload, req.files.imagefive)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagefive));

    req.flash("error_msg", "Lỗi: " + error + "");
    return res.redirect("/admin/product/add.html");
    // return res.render('admin/product/add', { errors: error });
  }
});

router.get("/edit/:id", (req, res) => {
  try {
    var idProduct = req.params.id;
    ProductModel.findById({
      _id: idProduct
    }, function (err, dataOnePro) {
      try {
        if (err) {
          console.log("err: " + err + "");
          req.flash("error_msg", "Error: " + err + "");
          return res.redirect("/admin/product/list.html");
        }
        console.log("data: " + dataOnePro);
        // console.log(dataOnePro.categoryID);
        ProductModel.find().then(dataPro => {
          CategoryModel.find().then(dataCate => {
            console.log("dataCate: " + dataCate);
            res.render("admin/product/edit", {
              errors: null,
              cateData: dataCate,
              productData: dataPro,
              dataOnePro: dataOnePro
            });
          });
        });
      } catch (error) {}
    });
  } catch (error) {
    console.log("Get platform: " + error);
    res.render("error", {
      error,
      title: "Error Data"
    });
  }
});
router.post("/edit/:id", checkAdmin, multipartMiddleware, (req, res) => {
  try {
    req.checkBody("name", "Tên sản phẩm không được để trống").notEmpty();
    req.checkBody("code", "Mã sản phẩm không được để trống").notEmpty();
    req
      .checkBody("code", "Mã sản phẩm phải có từ 3 đến 32 ký tự")
      .isLength({
        min: 3,
        max: 32
      });
    req.checkBody("unit", "Đơn vị sản phẩm không được để trống").notEmpty();
    req.checkBody("detail", "Chi tiết sản phẩm không được để trống").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      console.log("1: " + errors);
      // req.flash('errors', errors);
      // res.redirect('/admin/product/edit/' + req.params.id);
      // req.flash('errors', errors);
      ProductModel.findById({
        _id: req.params.id
      }, function (err, dataOnePro) {
        try {
          if (err) {
            console.log("err: " + err + "");
            req.flash("error_msg", "Error: " + err + "");
            return res.redirect("/admin/product/list.html");
          }
          console.log("data: " + dataOnePro);
          // console.log(dataOnePro.categoryID);
          ProductModel.find().then(dataPro => {
            CategoryModel.find().then(dataCate => {
              console.log("dataCate: " + dataCate);
              res.render("admin/product/edit", {
                errors: errors,
                cateData: dataCate,
                productData: dataPro,
                dataOnePro: dataOnePro
              });
            });
          });
        } catch (error) {}
      });

      // return res.render('admin/product/add', { errors: errors });
    } else {
      var imageProduct = req.files.imageproduct;
      console.log("imageProduct: " + JSON.stringify(imageProduct));
      var imageOne = req.files.imageone;
      console.log("imageOne: " + JSON.stringify(imageOne));
      var imageTwo = req.files.imagetwo;
      console.log("imageTwo: " + JSON.stringify(imageTwo));
      var imageThree = req.files.imagethree;
      console.log("imageThree: " + JSON.stringify(imageThree));
      var imageFour = req.files.imagefour;
      console.log("imageFour: " + JSON.stringify(imageFour));
      var imageFive = req.files.imagefive;
      console.log("imageFive: " + JSON.stringify(imageFive));
      var nameImageProductOld = "",
        nameImageOneOld = "",
        nameImageTwoOld = "",
        nameImageThreeOld = "",
        nameImageFourOld = "",
        nameImageFiveOld = "";
      var uploadImageProduct,
        uploadImageOne,
        uploadImageTwo,
        uploadImageThree,
        uploadImageFour,
        uploadImageFive;
      ProductModel.findOne({
        _id: req.params.id
      }, function (err, dataProduct) {
        if (err) {
          console.log(err);
          req.flash("error_msg", "Error find Database");
          return res.redirect("/admin/product/edit/" + req.params.id);
        }
        nameImageProductOld = dataProduct.imageProduct;
        nameImageOneOld = dataProduct.imageOne;
        nameImageTwoOld = dataProduct.imageTwo;
        nameImageThreeOld = dataProduct.imageThree;
        nameImageFourOld = dataProduct.imageFour;
        nameImageFiveOld = dataProduct.imageFive;
        AliasUrlModel.find({
            $and: [{
                aliasUrl: bodauTiengViet(req.body.name + " " + req.body.code)
              },
              {
                aliasUrl: {
                  $ne: dataProduct.aliasUrl
                }
              }
            ]
          },
          function (err, dataFindAlias) {
            if (err) {
              console.log(err);
              req.flash("error_msg", "Error find Database");
              return res.redirect("/admin/product/edit/" + req.params.id);
            }
            console.log("dataFindAlias: " + dataFindAlias);
            if (dataFindAlias != "") {
              req.flash("error_msg", "Alias url đã tồn tại.");
              return res.redirect("/admin/product/edit/" + req.params.id);
            } else {
              var pathUpload = path.join(
                appRoot,
                "public",
                "upload",
                "product"
              );
              console.log("===start upload===");
              var fullNameImageProduct = "",
                nameImageProduct = makename(),
                fullNameImageOne = "",
                nameImageOne = makename(),
                fullNameImageTwo = "",
                nameImageTwo = makename(),
                fullNameImageThree = "",
                nameImageThree = makename(),
                fullNameImageFour = "",
                nameImageFour = makename(),
                fullNameImageFive = "",
                nameImageFive = makename();
              if (
                typeof imageProduct != "undefined" &&
                imageProduct.originalFilename != ""
              ) {
                console.log("1");
                var extFile = imageProduct.originalFilename.split(".").pop();
                // nameImageOne = imageOne.originalFilename;
                fullNameImageProduct = nameImageProduct + "." + extFile;
                var dataImageProduct = fs.readFileSync(imageProduct.path);
                fs.writeFileSync(
                  path.join(pathUpload, fullNameImageProduct),
                  dataImageProduct
                );
                uploadImageProduct = true;
              } else {
                fullNameImageProduct = dataProduct.imageProduct;
              }
              if (
                typeof imageOne != "undefined" &&
                imageOne.originalFilename != ""
              ) {
                var extFile = imageOne.originalFilename.split(".").pop();
                fullNameImageOne = nameImageOne + "." + extFile;
                var dataImageOne = fs.readFileSync(imageOne.path);
                fs.writeFileSync(
                  path.join(pathUpload, fullNameImageOne),
                  dataImageOne
                );
                uploadImageOne = true;
              } else {
                fullNameImageOne = dataProduct.imageOne;
              }
              if (
                typeof imageTwo != "undefined" &&
                imageTwo.originalFilename != ""
              ) {
                var extFile = imageTwo.originalFilename.split(".").pop();
                fullNameImageTwo = nameImageTwo + "." + extFile;
                var dataImageTwo = fs.readFileSync(imageTwo.path);
                fs.writeFileSync(
                  path.join(pathUpload, fullNameImageTwo),
                  dataImageTwo
                );
                uploadImageTwo = true;
              } else {
                fullNameImageTwo = dataProduct.imageTwo;
              }
              if (
                typeof imageThree != "undefined" &&
                imageThree.originalFilename != ""
              ) {
                var extFile = imageThree.originalFilename.split(".").pop();
                fullNameImageThree = nameImageThree + "." + extFile;

                var dataImageThree = fs.readFileSync(imageThree.path);

                fs.writeFileSync(
                  path.join(pathUpload, fullNameImageThree),
                  dataImageThree
                );
                uploadImageThree = true;
              } else {
                fullNameImageThree = dataProduct.imageThree;
              }
              if (
                typeof imageFour != "undefined" &&
                imageFour.originalFilename != ""
              ) {
                console.log("5");
                var extFile = imageFour.originalFilename.split(".").pop();
                fullNameImageFour = nameImageFour + "." + extFile;
                var dataImageFour = fs.readFileSync(imageFour.path);
                fs.writeFileSync(
                  path.join(pathUpload, fullNameImageFour),
                  dataImageFour
                );
                uploadImageFour = true;
              } else {
                fullNameImageFour = dataProduct.imageFour;
              }
              if (
                typeof imageFive != "undefined" &&
                imageFive.originalFilename != ""
              ) {
                console.log("6");
                var extFile = imageFive.originalFilename.split(".").pop();
                fullNameImageFive = nameImageFive + "." + extFile;
                var dataImageFive = fs.readFileSync(imageFive.path);
                fs.writeFileSync(
                  path.join(pathUpload, fullNameImageFive),
                  dataImageFive
                );
                uploadImageFive = true;
              } else {
                fullNameImageFive = dataProduct.imageFive;
              }
              console.log("===end upload===");
              var proIDAsync = null;
              if (req.body.productidasync != 0) {
                proIDAsync = req.body.productidasync;
              }
              // dataProduct.nameCategory = req.body.name;
              // dataProduct.aliasUrl = bodauTiengViet(req.body.name);
              // dataProduct.categoryParent = cateParent;
              dataProduct.nameProduct = req.body.name;
              dataProduct.codeProduct = req.body.code;
              dataProduct.unitProduct = req.body.unit;
              dataProduct.aliasUrl = bodauTiengViet(
                req.body.name + " " + req.body.code
              );
              dataProduct.description = req.body.description;
              dataProduct.detailProduct = req.body.detail;
              dataProduct.imageProduct = fullNameImageProduct;
              dataProduct.imageOne = fullNameImageOne;
              dataProduct.imageTwo = fullNameImageTwo;
              dataProduct.imageThree = fullNameImageThree;
              dataProduct.imageFour = fullNameImageFour;
              dataProduct.imageFive = fullNameImageFive;
              dataProduct.priceProduct = req.body.price;
              dataProduct.productSync = req.body.productasync;
              dataProduct.productIDSync = proIDAsync;
              dataProduct.categoryID = req.body.category;
              dataProduct.status = req.body.statusradio;
              dataProduct.search = bodauTiengViet(
                req.body.name +
                " " +
                req.body.code +
                " " +
                req.body.unit +
                " " +
                req.body.description +
                " " +
                req.body.detail
              );
              dataProduct.save().then(oneProduct => {
                // AliasUrlModel.findOne(
                //   { idParent: req.params.id },
                //   (err, dataAlias) => {
                //     if (err) {
                //       console.log(err);
                //       req.flash("error_msg", "Lỗi cập nhật alias url");
                //       return res.redirect(
                //         "/admin/product/edit/" + req.params.id
                //       );
                //     }
                //     dataAlias.aliasUrl = bodauTiengViet(
                //       req.body.name + " " + req.body.code
                //     );
                //     dataAlias.save();

                var pathUpload = path.join(
                  appRoot,
                  "public",
                  "upload",
                  "product"
                );
                console.log("nameImageProductOld: " + nameImageProductOld);
                if (
                  typeof nameImageProductOld != "undefined" &&
                  nameImageProductOld != "" &&
                  uploadImageProduct == true
                ) {
                  if (
                    fs.existsSync(path.join(pathUpload, nameImageProductOld))
                  ) {
                    fs.unlinkSync(path.join(pathUpload, nameImageProductOld));
                  }
                }

                console.log("nameImageOneOld: " + nameImageOneOld);
                if (
                  typeof nameImageOneOld != "undefined" &&
                  nameImageOneOld != "" &&
                  uploadImageOne == true
                ) {
                  if (fs.existsSync(path.join(pathUpload, nameImageOneOld))) {
                    fs.unlinkSync(path.join(pathUpload, nameImageOneOld));
                  }
                }

                console.log("nameImageTwoOld: " + nameImageTwoOld);
                if (
                  typeof nameImageTwoOld != "undefined" &&
                  nameImageTwoOld != "" &&
                  uploadImageTwo == true
                )
                  if (fs.existsSync(path.join(pathUpload, nameImageTwoOld))) {
                    fs.unlinkSync(path.join(pathUpload, nameImageTwoOld));
                  }

                console.log("nameImageThreeOld: " + nameImageThreeOld);
                if (
                  typeof nameImageThreeOld != "undefined" &&
                  nameImageThreeOld != "" &&
                  uploadImageThree == true
                ) {
                  if (fs.existsSync(path.join(pathUpload, nameImageThreeOld))) {
                    fs.unlinkSync(path.join(pathUpload, nameImageThreeOld));
                  }
                }

                console.log("nameImageFourOld: " + nameImageFourOld);
                if (
                  typeof nameImageFourOld != "undefined" &&
                  nameImageFourOld != "" &&
                  uploadImageFour == true
                ) {
                  if (fs.existsSync(path.join(pathUpload, nameImageFourOld))) {
                    fs.unlinkSync(path.join(pathUpload, nameImageFourOld));
                  }
                }

                console.log("nameImageFiveOld: " + nameImageFiveOld);
                if (
                  typeof nameImageFiveOld != "undefined" &&
                  nameImageFiveOld != "" &&
                  uploadImageFive == true
                ) {
                  if (fs.existsSync(path.join(pathUpload, nameImageFiveOld))) {
                    fs.unlinkSync(path.join(pathUpload, nameImageFiveOld));
                  }
                }

                console.log("success");
                req.flash("success_msg", "Đã Sửa Thành Công");
                return res.redirect("/admin/product/list.html");
              });

              // });
            }
          }
        );
      });
    }
  } catch (error) {
    console.log("All: " + error + "");
    var pathUpload = path.join(appRoot, "public", "upload", "product");
    if (fs.existsSync(path.join(pathUpload, req.files.imageproduct)))
      fs.unlinkSync(path.join(pathUpload, req.files.imageproduct));
    if (fs.existsSync(path.join(pathUpload, req.files.imageone)))
      fs.unlinkSync(path.join(pathUpload, req.files.imageone));
    if (fs.existsSync(path.join(pathUpload, req.files.imagetwo)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagetwo));
    if (fs.existsSync(path.join(pathUpload, req.files.imagethree)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagethree));
    if (fs.existsSync(path.join(pathUpload, req.files.imagefour)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagefour));
    if (fs.existsSync(path.join(pathUpload, req.files.imagefive)))
      fs.unlinkSync(path.join(pathUpload, req.files.imagefive));

    req.flash("error_msg", "Lỗi: " + error + "");
    return res.redirect("/admin/product/edit.html");
  }
});
router.get("/del/:id", checkAdmin, function (req, res, next) {
  try {
    ProductModel.findById({
      _id: req.params.id
    }, function (err, data) {
      var fileImageProduct = "./public/upload/product/" + data.imageProduct;
      if (data.imageProduct != "" && fs.existsSync(fileImageProduct)) {
        console.log(fileImageProduct);
        fs.unlinkSync(fileImageProduct);
      }
      var fileImageOne = "./public/upload/product/" + data.imageOne;
      console.log("1");
      if (data.imageOne != "" && fs.existsSync(fileImageOne))
        fs.unlinkSync(fileImageOne);
      console.log("2");
      var fileImageTwo = "./public/upload/product/" + data.imageTwo;
      if (data.imageTwo != "" && fs.existsSync(fileImageTwo))
        fs.unlinkSync(fileImageTwo);
      console.log("3");
      console.log("imageThree: " + data.imageThree);
      var fileImageThree = "./public/upload/product/" + data.imageThree;
      console.log("fileImageThree: " + fileImageThree);
      if (data.imageThree != "" && fs.existsSync(fileImageThree))
        fs.unlinkSync(fileImageThree);
      var fileImageFour = "./public/upload/product/" + data.imageFour;
      if (data.imageFour != "" && fs.existsSync(fileImageFour))
        fs.unlinkSync(fileImageFour);
      var fileImageFive = "./public/upload/product/" + data.imageFive;
      if (data.imageFive != "" && fs.existsSync(fileImageFive))
        fs.unlinkSync(fileImageFive);
      ProductModel.findById({
        _id: req.params.id
      }).remove(function () {
        AliasUrlModel.findOne({
          idParent: req.params.id,
          type: "product"
        }).remove(err => {
          if (err) {
            console.log(err + "");
            req.flash("error_msg", "Xóa lỗi " + err + "");
            return res.redirect("/admin/product/list.html");
          }
          req.flash("success_msg", "Đã Xoá Thành Công");
          res.redirect("/admin/product/list.html");
        });
      });
    });
  } catch (error) {
    req.flash("error_msg", "Lỗi: " + error + "");
    res.redirect("/admin/product/list.html");
  }
});

router.get("/import-excel", checkAdmin, (req, res) => {
  try {
    return res.render("admin/product/importexcel", {
      title: "Import excell product"
    });
  } catch (error) {
    req.flash("error_msg", "Lỗi: " + error + "");
    res.redirect("/admin/product/list");
  }
});
router.post(
  "/import-excel",
  multipartMiddleware,
  checkAdmin,
  async (req, res) => {
    try {
      var pathUpload = path.join(
        appRoot,
        "public",
        "upload",
        "product",
        "excel"
      );

      if (!fs.existsSync(pathUpload)) {
        fs.mkdirSync(pathUpload);
      }
      // var excelFileDB = "";
      var excelFile = req.files.excelfile;
      // console.log('excel: ' + JSON.stringify(excelFile));
      if (excelFile == "undefined" || excelFile.originalFilename == "") {
        req.flash("error_msg", "Bạn chưa chọn tệp tin excel để import");
        return res.redirect("/admin/product/import-excel");
      } else {
        var extFileExcel = excelFile.originalFilename.split(".").pop();
        var fullNameExcell = makename() + "." + extFileExcel;
        // console.log(fullNameImageProduct);
        var dataExcel = fs.readFileSync(excelFile.path);
        // console.log(dataImageProduct);
        fs.writeFileSync(path.join(pathUpload, fullNameExcell), dataExcel);
        // imageProductDB = fullNameImageProduct;
        var workbook = XLSX.readFileSync(path.join(pathUpload, fullNameExcell));
        var sheet_name_list = workbook.SheetNames;
        (async () => {
          for (var i = 0; i < sheet_name_list.length; i++) {
            console.log("---sheetname---");
            console.log(sheet_name_list[i]);
            var xlData = XLSX.utils.sheet_to_json(
              workbook.Sheets[sheet_name_list[i]]
            );
            console.log("-----------");
            console.log(typeof sheet_name_list[i]);
            if (sheet_name_list[i] == "San_Pham") {
              console.log("---San pham---");

              for (var j = 0; j < xlData.length; j++) {
                if (j != 0) {
                  console.log(xlData[j]);
                  await ProductModel.findOne({
                    codeProduct: xlData[j].MSP
                  }).then(async dataCheckCodePro => {
                    if (dataCheckCodePro) {
                      var categoryData;
                      categoryData = await CategoryModel.findOne({
                        code: xlData[j].MDM
                      }).exec();

                      var categoryID;
                      if (!categoryData._id) {
                        categoryData = await CategoryModel.find({})
                          .limit(1)
                          .exec();
                      }
                      categoryID = categoryData._id;
                      ///////////////// UPDATE PRODUCT
                      await ProductModel.update({
                        codeProduct: xlData[j].MSP
                      }, {
                        $set: {
                          nameProduct: xlData[j].TSP,
                          aliasUrl: bodauTiengViet(
                            xlData[j].TSP + " " + xlData[j].MSP
                          ),
                          unitProduct: xlData[j].DVT,
                          detailProduct: xlData[j].TTSP,
                          priceProduct: xlData[j].GB,
                          imageProduct: xlData[j].ASP,
                          imageOne: xlData[j].A1,
                          imageTwo: xlData[j].A2,
                          imageThree: xlData[j].A3,
                          imageFour: xlData[j].A4,
                          imageFive: xlData[j].A5,
                          categoryID: categoryID
                        }
                      }).exec((err, data) => {
                        if (err) {
                          console.log(err + "");
                        }
                      });
                    } else {
                      var categoryData;
                      categoryData = await CategoryModel.findOne({
                        code: xlData[j].MDM
                      }).exec();
                      console.log("categoryData");
                      console.log(categoryData);
                      var categoryID;
                      if (!categoryData._id) {
                        categoryData = await CategoryModel.find({})
                          .limit(1)
                          .exec();
                      }
                      categoryID = categoryData._id;
                      await ProductModel.insertMany({
                          id: md5(Date.now()),
                          nameProduct: xlData[j].TSP,
                          codeProduct: xlData[j].MSP,
                          unitProduct: xlData[j].DVT,
                          aliasUrl: bodauTiengViet(
                            xlData[j].TSP + " " + xlData[j].MSP
                          ),
                          description: "",
                          priceProduct: xlData[j].GB,
                          detailProduct: xlData[j].TTSP,
                          imageProduct: xlData[j].ASP,
                          imageOne: xlData[j].A1,
                          imageTwo: xlData[j].A2,
                          imageThree: xlData[j].A3,
                          imageFour: xlData[j].A4,
                          imageFive: xlData[j].A5,
                          dateCreate: Date.now(),
                          productSync: false,
                          productIDSync: null,
                          categoryID: categoryID,
                          viewCounter: 0,
                          status: false
                        },
                        err => {
                          console.log(err);
                        }
                      );
                    }
                  });
                }
              }
            }
            if (sheet_name_list[i] == "Kich_Thuoc") {
              console.log("=========Kich thuoc========");
              var xlData_2 = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[i]]
              );
              for (var t = 0; t < xlData_2.length; t++) {
                if (t != 0) {
                  console.log(xlData_2[t]);
                  console.log("-----------------data kich thuoc");
                  var productDataCheck = await ProductModel.findOne({
                    codeProduct: xlData_2[t].MSP
                  }).exec();

                  console.log(productDataCheck);
                  console.log(productDataCheck._id);
                  if (productDataCheck) {
                    var checkProductSize = await sizeProductModel
                      .findOne({
                        idProduct: productDataCheck._id
                      })
                      .exec();
                    if (checkProductSize) {
                      await sizeProductModel
                        .update({
                          idProduct: productDataCheck._id
                        }, {
                          $set: {
                            sizeLength: xlData[t].CD,
                            sizeWidth: xlData[t].CR,
                            sizeHeight: xlData[t].CC,
                            priceProduct: xlData[t].GB,
                            status: true
                          }
                        })
                        .exec((err, data) => {
                          if (err) {
                            console.log(err + "");
                          }
                        });
                    } else {
                      await sizeProductModel.insertMany({
                          idProduct: productDataCheck._id,
                          sizeLength: xlData[t].CD,
                          sizeWidth: xlData[t].CR,
                          sizeHeight: xlData[t].CC,
                          priceProduct: xlData[t].GB,
                          status: true
                        },
                        err => {
                          console.log("a");
                          console.log(err);
                        }
                      );
                    }
                  }
                  // sizeProductModel
                  console.log("Success");
                }
              }
            }
          }
        })();

        req.flash("success_msg", "Import dữ liệu thành công.");
        return res.redirect("/admin/product/import-excel");
        // }
      }
    } catch (error) {
      req.flash("error_msg", "Lỗi: " + error + "");
      res.redirect("/admin/product/import-excel");
    }
  }
);

function checkAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/admin/dang-nhap.html");
  }
}
module.exports = router;