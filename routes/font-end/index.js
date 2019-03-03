var express = require("express");
var router = express.Router();
var NewsModel = require("../../models/news");
var CategoryModel = require("../../models/category");
var ProductModel = require("../../models/product");
var BannerModel = require("../../models/banner");
router.get("/", async (req, res) => {
  try {
    var currentPage = 1,
      totalData,
      pageSize = 15,
      pageCount;
    var dataArray = [];
    var dataList = [];
    if (typeof req.query.page !== "undefined") {
      currentPage = +req.query.page;
    }

    var dataProduct = await ProductModel.find({
        status: true,
        productSync: false
      })
      .sort({
        viewCounter: -1
      })
      .skip(pageSize * currentPage - pageSize)
      .limit(pageSize)
      .exec();

    totalData = await ProductModel.find({
        status: true,
        productSync: false
      })
      .count()
      .exec();

    pageCount = Math.ceil(totalData / pageSize).toFixed();

    var dataProductNew = await ProductModel.find({
        status: true,
        productSync: false
      })
      .sort({
        dateCreate: -1
      })
      .skip(0)
      .limit(15)
      .exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("index", {
      title: "Trang chủ",
      dataProduct,
      currentPage,
      totalData,
      pageSize,
      pageCount,
      dataProductNew,
      BannerSliderData
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      title: "Error Data",
      error: error + ""
    });
  }
});

router.get("/index", async (req, res) => {
  try {
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("error", {
      title: "Error Data",
      error: error + ""
    });
  }
});

router.get("/tin-tuc/:alias", async (req, res) => {
  try {
    var sAlias = req.params.alias;

    let data = await NewsModel.findOne({
      aliasUrl: sAlias,
      typeNews: 0,
      status: true
    }).exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Giới thiệu",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/gioi-thieu", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 1,
      status: true
    }).exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Giới thiệu",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/cach-mua-hang", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 2,
      status: true
    }).exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Cách mua hàng",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/huong-dan-thanh-toan", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 3,
      status: true
    }).exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Hướng dẫn thanh toán",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/giao-hang", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 4,
      status: true
    }).exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Giao hàng",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/bao-hanh", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 5,
      status: true
    }).exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Bảo hành",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/ban-quyen-thuong-hieu", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 6,
      status: true
    }).exec();

    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Bản quyền và thương hiệu",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/bao-ve-thong-tin-ca-nhan", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 7,
      status: true
    }).exec();
    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.render("font-end/news", {
      title: "Bảo vệ thông tin cá nhân",
      data,
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.get("/lien-he", async (req, res) => {
  try {
    let data = await NewsModel.findOne({
      typeNews: 8,
      status: true
    }).exec();
    var BannerSliderData = await BannerModel.find({
        locationBanner: 0,
        status: true
      }).sort({
        numberOrder: -1
      }).exec();

    res.render("font-end/news", {
      title: "Liên hệ",
      data,
      description: 'Liên hệ, lien he',
      BannerSliderData
    });
  } catch (error) {
    res.render("error", {
      title: "Error Data",
      error
    });
  }
});

router.post("/category/get-category-children", async (req, res) => {
  try {
    let data = await CategoryModel.find({
      $and: [{
          categoryParent: {
            $ne: null
          }
        },
        {
          status: true
        }
      ]
    }).exec();
    res.json({
      status: true,
      message: "Success",
      data
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.post("/banner/get-slider", async (req, res) => {
  try {
    var data = await BannerModel.find({
        locationBanner: 0,
        status: true
      })
      .sort({
        numberOrder: -1
      })
      .exec();

    res.json({
      status: true,
      data,
      message: "getBannerRightTopSuccess"
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.post("/banner/get-right-top", async (req, res) => {
  try {
    var dataBannerRightTop = await BannerModel.findOne({
      locationBanner: 1,
      status: true
    });
    res.json({
      status: true,
      dataBannerRightTop,
      message: "getBannerRightTopSuccess"
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.post("/banner/get-right-bottom", async (req, res) => {
  try {
    var dataBannerRightBottom = await BannerModel.findOne({
      locationBanner: 3,
      status: true
    });
    res.json({
      status: true,
      dataBannerRightBottom,
      message: "getBannerRightBottomSuccess"
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.post("/banner/get-right-center", async (req, res) => {
  try {
    var dataBannerRightCenter = await BannerModel.findOne({
      locationBanner: 2,
      status: true
    });
    res.json({
      status: true,
      dataBannerRightCenter,
      message: "getBannerRightCenterSuccess"
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});

router.post("/banner/get-center-bottom", async (req, res) => {
  try {
    var dataBannerCenterBottom = await BannerModel.findOne({
      locationBanner: 4,
      status: true
    });
    res.json({
      status: true,
      dataBannerCenterBottom,
      message: "getBannerCenterBottomSuccess"
    });
  } catch (error) {
    res.json({
      status: false,
      message: error + ""
    });
  }
});
module.exports = router;