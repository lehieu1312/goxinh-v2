var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({
  extended: false
});
var md5 = require("md5");
var path = require("path");
var fs = require("fs");
var fse = require("fs-extra");
var appRoot = require("app-root-path");
appRoot = appRoot.toString();
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
var XLSX = require("xlsx");
var productModel = require("../../models/product");
var sizeProductModel = require("../../models/sizeproduct");
var categoryModel = require("../../models/category");
var aliasUrlModel = require("../../models/aliasurl");
var multer = require("multer");
let checkAdmin = require("../../common/helper");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/upload/product");
  },
  filename: function(req, file, cb) {
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

function alias(str) {
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

function makename() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 20; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.get("/products", checkAdmin, async (req, res) => {
  try {
    let data = await productModel
      .aggregate([
        {
          $lookup: {
            from: "category", // other table name
            localField: "categoryID", // name of users table field
            foreignField: "_id", // name of userinfo table field
            as: "cateProduct" // alias for userinfo table
          }
        }
      ])
      .sort({
        codeProduct: -1
      })
      .exec();
    res.render("backend/products", {
      data
    });
  } catch (error) {
    res.render("error", {
      error
    });
  }
});

router.get("/products/add", checkAdmin, async (req, res) => {
  let data = new productModel({});
  let dataProduct = await productModel
    .find({
      productSync: false
    })
    .exec();
  let categories = await categoryModel.find().exec();
  let arrLibary = [];
  res.render("backend/products/add", {
    categories,
    data,
    dataProduct,
    arrLibary,
    errors: null
  });
});

router.post(
  "/products/add",
  checkAdmin,
  multipartMiddleware,
  async (req, res, next) => {
    try {
      req
        .checkBody("nameProduct", "Tên sản phẩm không được để trống")
        .notEmpty();
      req
        .checkBody("codeProduct", "Mã sản phẩm không được để trống")
        .notEmpty();
      req
        .checkBody("unitProduct", "Đơn vị sản phẩm không được để trống")
        .notEmpty();
      req
        .checkBody("priceProduct", "Giá sản phẩm không được để trống")
        .notEmpty();
      req.checkBody("priceProduct", "Giá sản phẩm phải là số").isInt();
      req
        .checkBody("detailProduct", "Thông tin sản phẩm không được để trống")
        .notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        req.flash("errors", errors);
        return res.redirect("/admin/products/add");
      }
      let dataBody = req.body;
      var image = req.files.image;

      var pathUpload = path.join(
        appRoot,
        "public",
        "upload",
        "product",
        dataBody.codeProduct
      );

      if (!fs.existsSync(pathUpload)) {
        fs.mkdirSync(pathUpload);
      }

      if (image == "undefined" || image.originalFilename == "") {
        req.flash("error_msg", "Ảnh sản phẩm không được trống.");
        return res.redirect("/admin/products/add");
      }

      let nameImage = null;
      if (typeof image != "undefined" && image.originalFilename != "") {
        var extFile = image.originalFilename.split(".").pop();
        nameImage = makename() + "." + extFile;
        var dataImage = fs.readFileSync(image.path);
        fs.writeFileSync(path.join(pathUpload, nameImage), dataImage);
      }

      //Upload libary product
      var libaryProduct = req.files.libary;
      if (
        typeof libaryProduct.length == "undefined" &&
        libaryProduct.originalFilename != ""
      ) {
        var extFile = libaryProduct.originalFilename.split(".").pop();
        var fullNamelibaryProduct = makename() + "." + extFile;
        var dataImageProduct = fs.readFileSync(libaryProduct.path);
        fs.writeFileSync(
          path.join(pathUpload, fullNamelibaryProduct),
          dataImageProduct
        );
      }
      if (libaryProduct.length > 1) {
        await libaryProduct.forEach(function(item) {
          var extFile = item.originalFilename.split(".").pop();
          var fullNameItemProduct = makename() + "." + extFile;
          var dataItemProduct = fs.readFileSync(item.path);
          fs.writeFileSync(
            path.join(pathUpload, fullNameItemProduct),
            dataItemProduct
          );
        });
      }

      dataBody.productSync = false;
      if (dataBody.productIDSync !== "0") {
        dataBody.productSync = true;
      } else {
        dataBody.productIDSync = null;
      }

      dataBody.aliasUrl = alias(
        dataBody.nameProduct + " " + dataBody.codeProduct
      );
      dataBody.imageProduct = nameImage;
      dataBody.search = bodauTiengViet(
        dataBody.nameProduct +
          " " +
          dataBody.codeProduct +
          " " +
          dataBody.unitProduct +
          " " +
          dataBody.description +
          " " +
          dataBody.detailProduct
      );
      var productData = new productModel(dataBody);

      productData.save().then(function(idP) {
        req.flash("success_msg", "Đã Thêm Thành Công");
        return res.redirect("/admin/products/add");
      });
    } catch (error) {
      console.log(error);
      req.flash("error_msg", "Lỗi: " + error + "");
      return res.redirect("/admin/products/add");
    }
  }
);

router.get("/products/edit/:id", async (req, res) => {
  try {
    var id = req.params.id;
    let data = await productModel.findById(id).exec();

    let dataProduct = await productModel.find().exec();
    let categories = await categoryModel.find().exec();
    let arrLibary = [];
    var pathUpload = path.join(
      appRoot,
      "public",
      "upload",
      "product",
      data.codeProduct
    );

    if (fs.existsSync(pathUpload)) {
      arrLibary = fs.readdirSync(pathUpload);
      arrLibary = arrLibary.filter(function(value, index, arr) {
        return value != data.imageProduct;
      });
    }

    res.render("backend/products/add", {
      errors: null,
      data,
      dataProduct,
      arrLibary,
      categories
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      error,
      title: "Error Data"
    });
  }
});
router.post(
  "/products/edit/:id",
  checkAdmin,
  multipartMiddleware,
  async (req, res) => {
    try {
      let id = req.params.id;
      req
        .checkBody("nameProduct", "Tên sản phẩm không được để trống")
        .notEmpty();
      req
        .checkBody("codeProduct", "Mã sản phẩm không được để trống")
        .notEmpty();
      req
        .checkBody("unitProduct", "Đơn vị sản phẩm không được để trống")
        .notEmpty();
      req
        .checkBody("priceProduct", "Giá sản phẩm không được để trống")
        .notEmpty();
      req.checkBody("priceProduct", "Giá sản phẩm phải là số").isInt();
      req
        .checkBody("detailProduct", "Thông tin sản phẩm không được để trống")
        .notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        req.flash("errors", errors);
        return res.redirect("/admin/products/edit/" + id);
      }
      let dataBody = req.body;
      var image = req.files.image;

      let data = await productModel.findById(id).exec();

      var pathUpload = path.join(
        appRoot,
        "public",
        "upload",
        "product",
        data.codeProduct
      );

      if (!fs.existsSync(pathUpload)) {
        fs.mkdirSync(pathUpload);
      }

      let nameImage = null;
      if (typeof image != "undefined" && image.originalFilename != "") {
        var extFile = image.originalFilename.split(".").pop();
        nameImage = makename() + "." + extFile;
        var dataImage = fs.readFileSync(image.path);
        fs.writeFileSync(path.join(pathUpload, nameImage), dataImage);
      }

      //Upload libary product
      var libaryProduct = req.files.libary;
      if (
        typeof libaryProduct.length == "undefined" &&
        libaryProduct.originalFilename != ""
      ) {
        var extFile = libaryProduct.originalFilename.split(".").pop();
        var fullNamelibaryProduct = makename() + "." + extFile;
        var dataImageProduct = fs.readFileSync(libaryProduct.path);
        fs.writeFileSync(
          path.join(pathUpload, fullNamelibaryProduct),
          dataImageProduct
        );
      }
      if (libaryProduct.length > 1) {
        await libaryProduct.forEach(function(item) {
          var extFile = item.originalFilename.split(".").pop();
          var fullNameItemProduct = makename() + "." + extFile;
          var dataItemProduct = fs.readFileSync(item.path);
          fs.writeFileSync(
            path.join(pathUpload, fullNameItemProduct),
            dataItemProduct
          );
        });
      }
      //Remove libary
      var arrDelLibary = dataBody.arrLibaryRemove;
      var arrTmpLibary = arrDelLibary.split("|");
      await arrTmpLibary.forEach(async function(item) {
        if (item != "") {
          if (
            fs.existsSync(
              path.join(
                appRoot,
                "public",
                "upload",
                "product",
                data.codeProduct,
                item
              )
            )
          )
            fs.unlinkSync(
              path.join(
                appRoot,
                "public",
                "upload",
                "product",
                data.codeProduct,
                item
              )
            );
        }
      });

      dataBody.productSync = false;
      if (dataBody.productIDSync !== "0") {
        dataBody.productSync = true;
      } else {
        dataBody.productIDSync = null;
      }

      dataBody.aliasUrl = alias(
        dataBody.nameProduct + " " + dataBody.codeProduct
      );
      dataBody.imageProduct = nameImage != null ? nameImage : data.imageProduct;
      dataBody.search = bodauTiengViet(
        dataBody.nameProduct +
          " " +
          dataBody.nameProduct +
          " " +
          dataBody.unitProduct +
          " " +
          dataBody.detailProduct
      );

      let dataUpdated = await productModel
        .updateOne(
          {
            _id: id
          },
          {
            $set: dataBody
          }
        )
        .exec();

      if (dataUpdated.ok) {
        if (dataBody.codeProduct !== data.codeProduct) {
          fse.renameSync(
            path.join(appRoot, "public", "upload", "product", data.codeProduct),
            path.join(
              appRoot,
              "public",
              "upload",
              "product",
              dataBody.codeProduct
            )
          );
        }
        req.flash("success_msg", "Đã Sửa Thành Công");
        res.redirect("/admin/products/edit/" + id);
      } else {
        req.flash("success_msg", "Không có bản ghi nào được sửa");
        res.redirect("/admin/products/edit/" + id);
      }
    } catch (error) {
      req.flash("error_msg", "Lỗi: " + error + "");
      return res.redirect("/admin/products/edit/" + req.params.id);
    }
  }
);
router.get("/products/move", async (req, res) => {
  console.log("vao....");
  let data = await productModel.find({ codeProduct: "SP8" }).exec();
  (async () => {
    for (let i = 0; i < data.length; i++) {
      let pathCode = path.join(
        appRoot,
        "public",
        "upload",
        "product",
        data[i].codeProduct
      );
      if (!fs.existsSync(pathCode)) {
        fs.mkdirSync(pathCode);
      }
      let imageP, image1, image2, image3, image4, image5;
      if (data[i].imageProduct)
        imageP = path.join(
          appRoot,
          "public",
          "upload",
          "product",
          data[i].imageProduct
        );
      if (data[i].imageOne)
        image1 = path.join(
          appRoot,
          "public",
          "upload",
          "product",
          data[i].imageOne
        );
      if (data[i].imageTwo)
        image2 = path.join(
          appRoot,
          "public",
          "upload",
          "product",
          data[i].imageTwo
        );
      if (data[i].imageThree)
        image3 = path.join(
          appRoot,
          "public",
          "upload",
          "product",
          data[i].imageThree
        );
      if (data[i].imageFour)
        image4 = path.join(
          appRoot,
          "public",
          "upload",
          "product",
          data[i].imageFour
        );
      if (data[i].imageFive)
        image5 = path.join(
          appRoot,
          "public",
          "upload",
          "product",
          data[i].imageFive
        );

      if (fs.existsSync(imageP))
        fse.moveSync(imageP, path.join(pathCode, data[i].imageProduct));

      if (fs.existsSync(image1))
        fse.moveSync(image1, path.join(pathCode, data[i].imageOne));

      if (fs.existsSync(image2))
        fse.moveSync(image2, path.join(pathCode, data[i].imageTwo));

      if (fs.existsSync(image3))
        fse.moveSync(image3, path.join(pathCode, data[i].imageThree));

      if (fs.existsSync(image4))
        fse.moveSync(image4, path.join(pathCode, data[i].imageFour));

      if (fs.existsSync(image5))
        fse.moveSync(image5, path.join(pathCode, data[i].imageFive));
    }
  })();
  res.redirect("/admin/products");
});
/// Delete one or multi product search
router.post("/products/del", checkAdmin, multipartMiddleware, (req, res) => {
  try {
    var arrId = req.body;
    (async () => {
      arrId.forEach(async item => {
        console.log("item: ", item);
        let data = await productModel.findById(item).exec();
        if (data) {
          var file = path.join(
            appRoot,
            "public",
            "upload",
            "product",
            data.codeProduct
          );
          fse.removeSync(file);
          productModel
            .findById(item)
            .deleteOne()
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
      msg: error + ""
    });
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
                      await ProductModel.update(
                        {
                          codeProduct: xlData[j].MSP
                        },
                        {
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
                        }
                      ).exec((err, data) => {
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
                      await ProductModel.insertMany(
                        {
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
                        .update(
                          {
                            idProduct: productDataCheck._id
                          },
                          {
                            $set: {
                              sizeLength: xlData[t].CD,
                              sizeWidth: xlData[t].CR,
                              sizeHeight: xlData[t].CC,
                              priceProduct: xlData[t].GB,
                              status: true
                            }
                          }
                        )
                        .exec((err, data) => {
                          if (err) {
                            console.log(err + "");
                          }
                        });
                    } else {
                      await sizeProductModel.insertMany(
                        {
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

module.exports = router;
