var express = require("express");
var router = express.Router();
var path = require("path");
var async = require("async");
var fs = require("fs");
var md5 = require("md5");
var moment = require("moment");
var appRoot = require("app-root-path");
appRoot = appRoot.toString();
var NewsModel = require("../../models/news");
var ProductModel = require("../../models/product");
var CategoryModel = require("../../models/category");
var BannerModel = require("../../models/banner");
var OrderProductModel = require("../../models/orderproduct");
var OrderBuyProductModel = require("../../models/orderbuyproduct");
var SizeProductModel = require("../../models/sizeproduct");
var multer = require("multer");
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(appRoot, "public", "upload", "order"));
  },
  filename: function (req, file, cb) {
    cb(false, file.originalname);
  }
});

var limit = {
  fileSize: 8 * 1024 * 1024
};
var upload = multer({
  storage: storage,
  limits: limit
});

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

router.get("/danh-muc/noi-that-phong-khach", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 15,
      pageCount;
    var dataArray = [];
    var dataList = [];
    let dataProduct = [];
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }
    let dataCate = await CategoryModel.findOne({
      code: "phongkhach",
      status: true
    }).exec();
    if (dataCate) {

      dataProduct = await CategoryModel.aggregate([{
            $match: {
              $or: [{
                _id: dataCate._id
              }, {
                categoryParent: dataCate._id
              }]
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "_id",
              foreignField: "categoryID",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $replaceRoot: {
              newRoot: "$products"
            }
          }
        ])
        .sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize)
        .exec();

      totalData = await CategoryModel.aggregate([{
          $match: {
            $or: [{
              _id: dataCate._id
            }, {
              categoryParent: dataCate._id
            }]
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "categoryID",
            as: "products"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $replaceRoot: {
            newRoot: "$products"
          }
        },
        {
          $count: "myCount"
        }
      ]).exec();
      totalData = totalData[0].myCount;
      pageCount = Math.ceil(totalData / pageSize).toFixed();
    }

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/category-menu", {
      title: "Nội thất phòng khách",
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      alias: "danh-muc/noi-that-phong-khach",
      titlePanel: "Nội thất phòng khách",
      BannerSliderData
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.get("/danh-muc/noi-that-phong-ngu", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 15,
      pageCount;
    var dataArray = [];
    var dataList = [];
    let dataProduct = [];
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }
    let dataCate = await CategoryModel.findOne({
      code: "phongngu",
      status: true
    }).exec();
    if (dataCate) {
      dataProduct = await CategoryModel.aggregate([{
            $match: {
              $or: [{
                _id: dataCate._id
              }, {
                categoryParent: dataCate._id
              }]
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "_id",
              foreignField: "categoryID",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $replaceRoot: {
              newRoot: "$products"
            }
          }
        ])
        .sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize)
        .exec();

      totalData = await CategoryModel.aggregate([{
          $match: {
            $or: [{
              _id: dataCate._id
            }, {
              categoryParent: dataCate._id
            }]
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "categoryID",
            as: "products"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $replaceRoot: {
            newRoot: "$products"
          }
        },
        {
          $count: "myCount"
        }
      ]).exec();
      totalData = totalData[0].myCount;
      pageCount = Math.ceil(totalData / pageSize).toFixed();
    }

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/category-menu", {
      title: "Nội thất phòng ngủ",
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      alias: "danh-muc/noi-that-phong-ngu",
      titlePanel: "Nội thất phòng ngủ",
      BannerSliderData
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.get("/danh-muc/noi-that-nha-bep", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 15,
      pageCount;
    var dataArray = [];
    var dataList = [];
    let dataProduct = [];
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }
    let dataCate = await CategoryModel.findOne({
      code: "nhabep",
      status: true
    }).exec();
    if (dataCate) {
      dataProduct = await CategoryModel.aggregate([{
            $match: {
              $or: [{
                _id: dataCate._id
              }, {
                categoryParent: dataCate._id
              }]
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "_id",
              foreignField: "categoryID",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $replaceRoot: {
              newRoot: "$products"
            }
          }
        ])
        .sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize)
        .exec();

      totalData = await CategoryModel.aggregate([{
          $match: {
            $or: [{
              _id: dataCate._id
            }, {
              categoryParent: dataCate._id
            }]
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "categoryID",
            as: "products"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $replaceRoot: {
            newRoot: "$products"
          }
        },
        {
          $count: "myCount"
        }
      ]).exec();
      totalData = totalData[0].myCount;
      pageCount = Math.ceil(totalData / pageSize).toFixed();
    }

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/category-menu", {
      title: "Nội thất phòng nhà bếp",
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      alias: "danh-muc/noi-that-nha-bep",
      titlePanel: "Nội thất nhà bếp",
      BannerSliderData
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.get("/danh-muc/trang-tri-ham-ruou", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 15,
      pageCount;
    var dataArray = [];
    var dataList = [];
    let dataProduct = [];
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }
    let dataCate = await CategoryModel.findOne({
      code: "hamruou",
      status: true
    }).exec();
    if (dataCate) {
      dataProduct = await CategoryModel.aggregate([{
            $match: {
              $or: [{
                _id: dataCate._id
              }, {
                categoryParent: dataCate._id
              }]
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "_id",
              foreignField: "categoryID",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $replaceRoot: {
              newRoot: "$products"
            }
          }
        ])
        .sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize)
        .exec();

      totalData = await CategoryModel.aggregate([{
          $match: {
            $or: [{
              _id: dataCate._id
            }, {
              categoryParent: dataCate._id
            }]
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "categoryID",
            as: "products"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $replaceRoot: {
            newRoot: "$products"
          }
        },
        {
          $count: "myCount"
        }
      ]).exec();
      totalData = totalData[0].myCount;
      pageCount = Math.ceil(totalData / pageSize).toFixed();
    }

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/category-menu", {
      title: "Trang trí hầm rượu",
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      alias: "danh-muc/trang-tri-ham-ruou",
      titlePanel: "Trang trí hầm rượu",
      BannerSliderData
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.get("/danh-muc/do-go-xuat-khau", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 15,
      pageCount;
    var dataArray = [];
    var dataList = [];
    let dataProduct = [];
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }
    let dataCate = await CategoryModel.findOne({
      code: "dogoxuatkhau",
      status: true
    }).exec();
    if (dataCate) {
      dataProduct = await CategoryModel.aggregate([{
            $match: {
              $or: [{
                _id: dataCate._id
              }, {
                categoryParent: dataCate._id
              }]
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "_id",
              foreignField: "categoryID",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $replaceRoot: {
              newRoot: "$products"
            }
          }
        ])
        .sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize)
        .exec();

      totalData = await CategoryModel.aggregate([{
          $match: {
            $or: [{
              _id: dataCate._id
            }, {
              categoryParent: dataCate._id
            }]
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "categoryID",
            as: "products"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $replaceRoot: {
            newRoot: "$products"
          }
        },
        {
          $count: "myCount"
        }
      ]).exec();
      totalData = totalData[0].myCount;
      pageCount = Math.ceil(totalData / pageSize).toFixed();
    }

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/category-menu", {
      title: "Đồ gỗ xuất khẩu",
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      alias: "danh-muc/do-go-xuat-khau",
      titlePanel: "Đồ gỗ xuất khẩu",
      BannerSliderData
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.get("/danh-muc/noi-that-phong-tho", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 15,
      pageCount;

    let dataProduct = [];
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }
    let dataCate = await CategoryModel.findOne({
      code: "phongtho",
      status: true
    }).exec();
    if (dataCate) {
      dataProduct = await CategoryModel.aggregate([{
            $match: {
              $or: [{
                _id: dataCate._id
              }, {
                categoryParent: dataCate._id
              }]
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "_id",
              foreignField: "categoryID",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $replaceRoot: {
              newRoot: "$products"
            }
          }
        ])
        .sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize)
        .exec();

      totalData = await CategoryModel.aggregate([{
          $match: {
            $or: [{
              _id: dataCate._id
            }, {
              categoryParent: dataCate._id
            }]
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "categoryID",
            as: "products"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $replaceRoot: {
            newRoot: "$products"
          }
        },
        {
          $count: "myCount"
        }
      ]).exec();

      totalData = totalData[0].myCount;
      pageCount = Math.ceil(totalData / pageSize).toFixed();
    }

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/category-menu", {
      title: "Nội thất phòng thờ",
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      alias: "danh-muc/noi-that-phong-tho",
      titlePanel: "Nội thất phòng thờ",
      BannerSliderData
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.get("/danh-muc/:alias", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 20,
      pageCount;

    let dataProduct = [];
    let titlePanel = 'Goxinh.net';
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }

    let dataCate = await CategoryModel.findOne({
      aliasUrl: req.params.alias,
      status: true
    }).exec();
    if (dataCate) {
      console.log(dataCate);
      titlePanel = dataCate.nameCategory;
      dataProduct = await CategoryModel.aggregate([{
            $match: {
              $or: [{
                _id: dataCate._id
              }, {
                categoryParent: dataCate._id
              }]
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "_id",
              foreignField: "categoryID",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $replaceRoot: {
              newRoot: "$products"
            }
          }
        ]).sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize).exec();
      console.log(dataProduct);

      totalData = await CategoryModel.aggregate([{
          $match: {
            $or: [{
              _id: dataCate._id
            }, {
              categoryParent: dataCate._id
            }]
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "categoryID",
            as: "products"
          }
        },
        {
          $unwind: "$products"
        },
        {
          $replaceRoot: {
            newRoot: "$products"
          }
        },
        {
          $count: "myCount"
        }
      ]).exec();
      console.log(totalData);
      if (totalData.length > 0) {
        totalData = totalData[0].myCount;
        pageCount = Math.ceil(totalData / pageSize).toFixed();
      }

    }

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/category", {
      title: titlePanel,
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      titlePanel,
      BannerSliderData
    });


  } catch (error) {
    console.log(error);
    res.render("error", {
      title: "Error Data"
    });
  }
});


router.get("/tim-kiem", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 20,
      pageCount;

    let dataProduct = [];

    if (typeof req.query.page !== "undefined")
      currentPage = +req.query.page;

    var sSearch = "";
    if (req.query.search) {
      sSearch = req.query.search;

      dataProduct = await ProductModel.find({
          $and: [{
              $or: [{
                search: {
                  $regex: sSearch
                }
              }, {
                aliasUrl: {
                  $regex: sSearch
                }
              }, {
                nameProduct: {
                  $regex: sSearch
                }
              }]
            },
            {
              status: true
            },
            {
              productSync: false
            }
          ]
        }).sort({
          viewCounter: -1
        })
        .skip(pageSize * currentPage - pageSize)
        .limit(pageSize).exec();

      totalData = await ProductModel.find({
        $and: [{
            $or: [{
              search: {
                $regex: sSearch
              }
            }, {
              aliasUrl: {
                $regex: sSearch
              }
            }, {
              nameProduct: {
                $regex: sSearch
              }
            }]
          },
          {
            status: true
          },
          {
            productSync: false
          }
        ]
      }).count().exec();
      console.log(totalData);

      if (totalData > 0) {
        pageCount = Math.ceil(totalData / pageSize).toFixed();
      }

      var BannerSliderData = await BannerModel.find({
          locationBanner: 0,
          status: true
        })
        .sort({
          numberOrder: -1
        })
        .exec();

      res.render("font-end/search", {
        title: "Tìm kiếm",
        dataProduct,
        currentPage,
        totalData,
        pageSize,
        pageCount,
        url: "tim-kiem?search=" + sSearch,
        titlePanel: "Tìm kiếm",
        BannerSliderData
      });

    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.render("error", {
      title: "Error Data"
    });
  }
});

router.get("/san-pham/:alias", (req, res) => {
  console.log('aaaaa');
  var sAliasUrl = req.params.alias;
  try {
    CategoryModel.find({
      $and: [{
        categoryParent: null
      }, {
        status: true
      }]
    }).then(dataCateParent => {
      // console.log("dataCateParent: " + dataCateParent);
      CategoryModel.find({
        $and: [{
          categoryParent: {
            $ne: null
          }
        }, {
          status: true
        }]
      }).then(dataCateChildren => {
        // console.log('dataCateChildren: ' + dataCateChildren);
        ProductModel.findOne({
          aliasUrl: sAliasUrl
        }).then(dataOneProduct => {
          // console.log('dataOneProduct.viewCounter: ' + dataOneProduct.viewCounter);
          if (
            typeof dataOneProduct.viewCounter == "undefined" ||
            dataOneProduct.viewCounter == null
          )
            dataOneProduct.viewCounter = 0;
          dataOneProduct.viewCounter = parseInt(dataOneProduct.viewCounter) + 1;
          SizeProductModel.find({
            idProduct: dataOneProduct._id
          }).then(dataSizeProduct => {
            // console.log("dataSizeProduct: " + dataSizeProduct);
            dataOneProduct.save().then(() => {
              if (dataOneProduct) {
                ProductModel.find({
                    $and: [{
                        categoryID: dataOneProduct.categoryID
                      },
                      {
                        _id: {
                          $ne: dataOneProduct._id
                        }
                      },
                      {
                        productSync: false
                      }
                    ]
                  })
                  .sort({
                    viewCounter: -1
                  })
                  .limit(5)
                  .then(productInvolve => {
                    // console.log('productInvolve: ' + productInvolve);
                    ProductModel.find({
                        productIDSync: dataOneProduct._id
                      })
                      .limit(3)
                      .then(productSync => {
                        let libImage = [];
                        let libImageTmp = [];
                        let pathImage = path.join(appRoot, 'public', 'upload', 'product', dataOneProduct.codeProduct);
                        console.log(pathImage);
                        if (fs.existsSync(pathImage)) {
                          libImageTmp = fs.readdirSync(pathImage);
                          libImage = libImageTmp.slice();
                        }
                        if (productSync) {
                          res.render("font-end/product", {
                            title: dataOneProduct.nameProduct,
                            dataOneProduct: dataOneProduct,
                            productSync: productSync,
                            productInvolve: productInvolve,
                            dataCateParent: dataCateParent,
                            dataSizeProduct: dataSizeProduct,
                            libImage,
                            dataCateChildren: dataCateChildren,
                            descriptions: dataOneProduct.nameProduct +
                              ", " +
                              dataOneProduct.codeProduct +
                              ", " +
                              dataOneProduct.nameProduct +
                              " " +
                              dataOneProduct.codeProduct +
                              ", " +
                              dataOneProduct.description +
                              ", " +
                              "nội thất trang trí,gỗ trang trí,nội thất gỗ xinh,nội thất,gỗ nội thất,gỗ xinh,goxinh.net"
                          });
                        } else {
                          ProductModel.find({
                              productSync: true
                            })
                            .limit(3)
                            .then(productSync => {




                              res.render("font-end/product", {
                                title: dataOneProduct.nameProduct,
                                dataOneProduct: dataOneProduct,
                                productSync: productSync,
                                productInvolve: productInvolve,
                                dataCateParent: dataCateParent,
                                libImage,
                                dataCateChildren: dataCateChildren,
                                descriptions: dataOneProduct.nameProduct +
                                  ", " +
                                  dataOneProduct.codeProduct +
                                  ", " +
                                  dataOneProduct.nameProduct +
                                  " " +
                                  dataOneProduct.codeProduct +
                                  ", " +
                                  dataOneProduct.description +
                                  ", " +
                                  "nội thất trang trí,gỗ trang trí,nội thất gỗ xinh,nội thất,gỗ nội thất,gỗ xinh,goxinh.net"
                              });
                            });
                        }
                      });
                  });
              } else {
                res.render("404", {
                  title: "Page Not Found"
                });
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error + "");
    res.render("error", {
      title: "Error Data",
      error: error + ""
    });
  }
});

router.post("/order-on-request", multipartMiddleware, (req, res) => {
  console.log("==================da vao================");
  try {
    // console.log(req.files);
    var imageOrder = req.files.image;
    var dataBody = req.body;
    req.checkBody("name", "Tên  không được để trống").notEmpty();
    req.checkBody("email", "Email không được để trống").notEmpty();
    // req.checkBody('email', 'Email nhập không đúng').isEmail();
    req
      .checkBody("phonenumber", "Số điện thoại không được để trống")
      .notEmpty();
    // req.checkBody('phonenumber', 'Số điện thoại phải là số').isNumeric();
    req.checkBody("content", "Nội dung không được để trống").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      // console.log('1: ' + errors);
      CategoryModel.find({
          $and: [{
            categoryParent: null
          }, {
            status: true
          }]
        },
        function (err, dataCateParent) {
          if (err) {
            console.log("1");
            // console.log(err);
            return res.render("error", {
              title: "Error Get Data",
              error: err
            });
          }
          console.log("dataCateParent: " + dataCateParent);
          CategoryModel.find({
              $and: [{
                categoryParent: {
                  $ne: null
                }
              }, {
                status: true
              }]
            },
            function (error, dataCateChildren) {
              if (error) {
                console.log(error);
                return res.render("error", {
                  title: "Error Get Data",
                  error: error
                });
              }
              // req.flash('success_msg', 'Bạn đã đặt hàng thành công');
              return res.render("font-end/checkok", {
                title: "Đặt hàng yêu cầu",
                dataCateParent: dataCateParent,
                dataCateChildren: dataCateChildren,
                error_msg: "Bạn đã đặt hàng không thành công",
                errors: errors
              });
            }
          );
        }
      );
      // req.flash('errors', errors);
      // return res.render('admin/product/add', { errors: errors });
    } else {
      if (imageOrder.size > 8000000) {
        CategoryModel.find({
            $and: [{
              categoryParent: null
            }, {
              status: true
            }]
          },
          function (err, dataCateParent) {
            if (err) {
              console.log(err);
              return res.render("error", {
                title: "Error Get Data",
                error: err
              });
            }
            console.log("dataCateParent: " + dataCateParent);
            CategoryModel.find({
                $and: [{
                  categoryParent: {
                    $ne: null
                  }
                }, {
                  status: true
                }]
              },
              function (error, dataCateChildren) {
                if (error) {
                  console.log(error);
                  return res.render("error", {
                    title: "Error Get Data",
                    error: error
                  });
                }
                // req.flash('success_msg', 'Bạn đã đặt hàng thành công');
                return res.render("font-end/checkok", {
                  title: "Đặt hàng yêu cầu",
                  dataCateParent: dataCateParent,
                  dataCateChildren: dataCateChildren,
                  error_msg: "Bạn đã đặt hàng không thành công do tệp tải lên quá kích cỡ(8Mb)"
                });
              }
            );
          }
        );
      }
      // Function send mail
      let sendLinkMail = (nameFrom, phoneFrom, mailForm) => {
        return new Promise((resolve, reject) => {
          var transporter = nodemailer.createTransport({ // config mail server
            host: 'smtp.gmail.com',
            // port:'465',
            auth: {
              user: 'notification.goxinh.net@gmail.com',
              pass: 'nlah13122412!@#'
            }
          });
          transporter.use('compile', hbs({
            viewPath: path.join(appRoot, 'views'),
            extName: '.ejs'
          }));

          var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'Thông báo từ goxinh.net',
            to: 'woodenvina@gmail.com', //woodenvina@gmail.com
            subject: 'Bạn có đơn hàng theo yêu cầu từ goxinh.net.Vui lòng kiểm tra đơn hàng',
            text: `Bạn có đơn hàng theo yêu cầu từ: ${nameFrom} - ${phoneFrom} - ${mailForm} trên goxinh.net. Vui lòng kiểm tra đơn hàng`,
            html: `<b>Bạn có đơn hàng theo yêu cầu từ: ${nameFrom} - ${phoneFrom} - ${mailForm} trên goxinh.net. Vui lòng kiểm tra đơn hàng</b>`
          }
          transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
              return reject(err);
            }
            console.log('info mail: ' + info);
            console.log('info mail 2: ' + JSON.stringify(info));
            return resolve('Message sent: ' + info.response);

          });
        });
      }

      var nameImage;
      var pathUpload = path.join(appRoot, "public", "upload", "order");
      if (
        typeof imageOrder != "undefined" &&
        imageOrder.originalFilename != ""
      ) {
        nameImage = md5(Date.now()) + "." + imageOrder.name.split(".").pop();
        console.log("ten: " + nameImage);
        var dataImage = fs.readFileSync(imageOrder.path);
        console.log("dataImage: " + dataImage);
        fs.writeFileSync(path.join(pathUpload, nameImage), dataImage);
      }
      var orderProduct = new OrderProductModel({
        name: dataBody.name,
        email: dataBody.email,
        phoneNumber: dataBody.phonenumber,
        image: nameImage,
        content: dataBody.content.trim(),
        dateCreate: Date.now(),
        status: false
      });
      orderProduct.save().then(async () => {
        await sendLinkMail(dataBody.name, dataBody.phonenumber, dataBody.email);
        // req.flash('success_msg', 'Bạn đã đặt hàng thành công');
        return res.redirect('/order-success');
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error", {
      title: "Error Data",
      error: error + ""
    });
  }
});
router.get("/download-image-order/:image", (req, res) => {
  try {
    var pathFile = path.join(
      appRoot,
      "public",
      "upload",
      "order",
      req.params.image
    );
    if (fs.existsSync(pathFile)) {
      res.download(pathFile);
    } else {
      console.log("Not Find Folder");
      res.render("not-find-file", {
        title: "Not find file"
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error", {
      title: "Error Data",
      error: error
    });
  }
});
router.post("/getprice-sizeproduct", (req, res) => {
  req.checkBody("idSizeProduct", "Có giá trị để trống").notEmpty();
  // req.checkBody('hinh', 'Giá Trị "hinh" không được rổng').notEmpty();
  // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
  var errors = req.validationErrors();
  if (errors) {
    return res.json({
      status: 3,
      data: errors
    });
  }

  SizeProductModel.findById(req.body.idSizeProduct).then(data => {
    if (data) {
      return res.json({
        status: 1,
        data: data
      });
    } else {
      return res.json({
        status: 3,
        data: data
      });
    }
    // console.log(data);
  });
});
router.post("/getprice-productsync", (req, res) => {
  req.checkBody("idProductSync", "Có giá trị để trống").notEmpty();
  // req.checkBody('hinh', 'Giá Trị "hinh" không được rổng').notEmpty();
  // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
  var errors = req.validationErrors();
  if (errors) {
    return res.json({
      status: 3,
      data: errors
    });
  }

  ProductModel.findById(req.body.idProductSync).then(data => {
    // console.log(data);
    if (data) {
      return res.json({
        status: 1,
        data: data
      });
    } else {
      return res.json({
        status: 3,
        data: data
      });
    }
  });
});

// router.post("/order-product", (req, res) => {
//   console.log(req.body);

//   res.json({
//     status: true,
//     msg: 'success'
//   });
// });

router.get("/order-product", (req, res) => {
  var idProduct, idProductSync, idSizeProduct, soLuong, sumMoney;
  idProduct = req.query.idp;
  console.log(idProduct);
  idSizeProduct = req.query.idsip;
  console.log(idSizeProduct);
  idProductSync = req.query.idps;
  console.log(idProductSync);
  soLuong = req.query.sl;
  sumMoney = req.query.su;

  if (!idProduct || !soLuong) {
    CategoryModel.find({
        $and: [{
          categoryParent: null
        }, {
          status: true
        }]
      },
      function (err, dataCateParent) {
        if (err) {
          console.log(err);
          return res.render("error", {
            title: "Error Get Data",
            error: err
          });
        }
        console.log("dataCateParent: " + dataCateParent);
        CategoryModel.find({
            $and: [{
              categoryParent: {
                $ne: null
              }
            }, {
              status: true
            }]
          },
          function (error, dataCateChildren) {
            if (error) {
              console.log(error);
              return res.render("error", {
                title: "Error Get Data",
                error: error
              });
            }
            // req.flash('success_msg', 'Bạn đã đặt hàng thành công');
            return res.render("font-end/checkok", {
              title: "Đặt hàng",
              dataCateParent: dataCateParent,
              dataCateChildren: dataCateChildren,
              error_msg: "Không có sản phẩm để đặt hàng",
              errors: null
            });
          }
        );
      }
    );
  } else {
    CategoryModel.find({
        $and: [{
          categoryParent: null
        }, {
          status: true
        }]
      },
      function (err, dataCateParent) {
        if (err) {
          console.log(err);
          return res.render("error", {
            title: "Error Get Data",
            error: err
          });
        }
        console.log("dataCateParent: " + dataCateParent);
        CategoryModel.find({
            $and: [{
              categoryParent: {
                $ne: null
              }
            }, {
              status: true
            }]
          },
          function (error, dataCateChildren) {
            if (error) {
              console.log(error);
              return res.render("error", {
                title: "Error Get Data",
                error: error
              });
            }
            console.log("dataCateChildren: " + dataCateChildren);

            res.render("font-end/info-order", {
              title: "Đặt hàng",
              dataCateParent: dataCateParent,
              dataCateChildren: dataCateChildren,
              idProduct,
              idSizeProduct,
              soLuong,
              sumMoney,
              idProductSync
            });
          }
        );
      }
    );
  }
  // res.render('font-end/info-order', { idProduct, idSizeProduct, soLuong, idProductSync });
});
router.post("/order-product", async (req, res) => {
  try {
    let dataBody = req.body;
    req.checkBody("name", "Tên không được để trống").notEmpty();
    req.checkBody("email", "Email không được để trống").notEmpty();
    req
      .checkBody("phonenumber", "Số điện thoại không được để trống")
      .notEmpty();
    req
      .checkBody("phonenumber", "Số điện thoại không được để trống")
      .isNumeric();
    req.checkBody("address", "Địa chỉ không được để trống").notEmpty();
    req.checkBody("idproduct", "Chưa chọn sản phẩm").notEmpty();
    req.checkBody("soluong", "chưa chọn số lượng").notEmpty();
    // req.checkBody('priceproduct', 'chưa chọn giá sản phẩm').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      console.log(JSON.stringify(errors));
      req.flash("errors", errors);
      return res.redirect(
        "/order-product?idp=" +
        dataBody.idproduct +
        "&idps=" +
        dataBody.idproductsync +
        "&idsip=" +
        dataBody.idsizeproduc +
        "&sl=" +
        dataBody.soluong
      );
    }

    var getProduct = (id, arrID) => {
      return new Promise(async (resolve, reject) => {
        try {
          var dataProductSync = await ProductModel.findById(id).exec();
          console.log("dataProductSync: " + dataProductSync);
          var tmpProduct = {
            id: dataProductSync._id,
            name: dataProductSync.nameProduct,
            idSize: null,
            size: null,
            price: dataProductSync.priceProduct,
            image: dataProductSync.imageProduct,
            quanlity: 1,
            money: dataProductSync.priceProduct
          };

          arrID.push(tmpProduct);
          resolve("success");
          // console.log('arrIDProduct---: ' + JSON.stringify(arrIDProduct));
        } catch (error) {
          reject(error);
        }
      });
    };

    var idsizep = null;
    var sizeProduct = "";
    if (dataBody.idsizeproduct != 0 && dataBody.idsizeproduct != "") {
      idsizep = dataBody.idsizeproduct;
      var dataProductsize = await SizeProductModel.findById(idsizep).exec();
      sizeProduct =
        dataProductsize.sizeLength +
        "x" +
        dataProductsize.sizeWidth +
        "x" +
        dataProductsize.sizeHeight;
    }

    var cartProduct = [];
    var giaSanPham;
    ProductModel.findById(dataBody.idproduct).then(async dataProductOne => {
      console.log(
        "dataProductOne.priceProduct: " + dataProductOne.priceProduct
      );
      // giaSanPham = dataProductOne.priceProduct;
      cartProduct = [{
        id: dataBody.idproduct,
        name: dataProductOne.nameProduct,
        idSize: idsizep,
        size: sizeProduct,
        price: dataProductOne.priceProduct,
        image: dataProductOne.imageProduct,
        quanlity: dataBody.soluong,
        money: dataBody.soluong * dataProductOne.priceProduct
      }];
      if (dataBody.idproductsync) {
        var checkArrproduct = dataBody.idproductsync.split(";");

        for (let kq of checkArrproduct) {
          console.log("kq 1: " + kq);
          // console.log('kq: ' + checkArrproduct[kq]);
          if (kq) {
            await getProduct(kq, cartProduct);
          }
        }
      }

      // Function send mail
      let sendLinkMail = (totalPrice, nameFrom, phoneFrom, mailForm) => {
        return new Promise((resolve, reject) => {
          var transporter = nodemailer.createTransport({ // config mail server
            host: 'smtp.gmail.com',
            // port:'465',
            auth: {
              user: 'notification.goxinh.net@gmail.com',
              pass: 'nlah13122412!@#'
            }
          });
          transporter.use('compile', hbs({
            viewPath: path.join(appRoot, 'views'),
            extName: '.ejs'
          }));

          var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'Thông báo từ goxinh.net',
            to: 'woodenvina@gmail.com', //woodenvina@gmail.com
            subject: 'Bạn có đơn hàng mới từ goxinh.net.Vui lòng kiểm tra đơn hàng',
            text: `Bạn có đơn hàng mới trị giá:  ${totalPrice} từ ${nameFrom} - ${phoneFrom} - ${mailForm} trên goxinh.net. Vui lòng kiểm tra đơn hàng`,
            html: `<b>Bạn có đơn hàng mới trị giá:  ${totalPrice} từ ${nameFrom} - ${phoneFrom} - ${mailForm} trên goxinh.net. Vui lòng kiểm tra đơn hàng</b>`
          }
          transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
              return reject(err);
            }
            console.log('info mail: ' + info);
            console.log('info mail 2: ' + JSON.stringify(info));
            return resolve('Message sent: ' + info.response);

          });
        });
      }

      console.log("arrIDProduct: " + cartProduct);
      console.log("arrIDProduct: " + JSON.stringify(cartProduct));
      var orderBuyProductModel = new OrderBuyProductModel({
        name: dataBody.name,
        email: dataBody.email,
        phoneNumber: dataBody.phonenumber,
        address: dataBody.address,
        notes: dataBody.notes,
        cartProduct: cartProduct,
        summaryMoney: dataBody.sumarymoney,
        dateCreate: moment(Date.now()).format(),
        statusOrder: 0,
        status: false
      });
      orderBuyProductModel.save().then(async () => {
        console.log('abc');
        await sendLinkMail(dataBody.sumarymoney, dataBody.name, dataBody.phonenumber, dataBody.email);
        return res.redirect('/order-success');
      });
    });
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Lỗi: " + error + "");
    return res.redirect("/admin/product/edit.html");
  }
});

router.get("/order-success", async (req, res) => {
  let dataCateParent = await CategoryModel.find({
    $and: [{
      categoryParent: null
    }, {
      status: true
    }]
  }).exec();

  let dataCateChildren = await CategoryModel.find({
    $and: [{
      categoryParent: {
        $ne: null
      }
    }, {
      status: true
    }]
  }).exec();

  console.log('vao dat hang');
  return res.render("font-end/checkok", {
    title: "Đặt hàng",
    dataCateParent: dataCateParent,
    dataCateChildren: dataCateChildren,
    success_msg: "Bạn đã đặt hàng thành công",
    errors: ''
  });
});
module.exports = router;