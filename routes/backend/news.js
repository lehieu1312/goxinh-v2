let express = require("express");
let router = express.Router();
var newsModel = require("../../models/news");
let checkAdmin = require("../../common/helper");
var appRoot = require('app-root-path');
appRoot = appRoot.toString();
var md5 = require("md5");
var path = require("path");
var fse = require("fs-extra");
var fs = require("fs");
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();


function searchText(str) {
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

function makename() {
    var text = "";
    var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

router.get("/news", checkAdmin, async (req, res) => {
    let data = await newsModel.find().exec();
    res.render("backend/news/index", {
        data
    });
});
router.get("/news/add", checkAdmin, async (req, res) => {
    let data = new newsModel({});
    res.render("backend/news/add", {
        data
    });
});

router.post("/news/add", checkAdmin, multipartMiddleware, async (req, res) => {
    try {
        req.checkBody("nameNews", '"Tên bài viết" không được để trống').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            let data = await newsModel.find().exec();
            return res.render("backend/news/add", {
                data,
                errors
            });
        }
        let newsCheckExist = await newsModel.findOne({
            alias: alias(req.body.nameNews)
        }).exec();

        if (newsCheckExist) {
            req.flash("error_msg", "Tên bài viết đã tồn tại");
            return res.redirect("/admin/news/add");
        }
        // var pathUpload = path.join(appRoot,"public","upload","news");
        // if (!fs.existsSync(pathUpload)) {
        //     fs.mkdirSync(pathUpload);
        // }
        // var imageNews = req.files.image;
        // let nameImageNews = 'no-imgae.png'
        // if (imageNews != "undefined" && imageNews.originalFilename != "") {
        //     var extFileImage = imageNews.originalFilename.split(".").pop();
        //     var fullNameImageNews = makename() + "." + extFileImage;
        //     var dataImageNews = fs.readFileSync(imageNews.path);
        //     fs.writeFileSync(
        //         path.join(pathUpload, fullNameImageNews),
        //         dataImageNews
        //     );
        //     nameImageNews = fullNameImageNews
        // }

        var data = new newsModel({
            nameNews: req.body.nameNews,
            descriptionNews: req.body.descriptionNews,
            detailNews: req.body.detailNews,
            aliasUrl: alias(req.body.nameNews),
            typeNews: req.body.typeNews,
            createdAt: Date.now(),
            status: req.body.status
        })
        data.save().then(() => {
            req.flash("success_msg", "Đã Thêm Thành Công");
            res.redirect("/admin/news/add");
        })
    } catch (error) {
        console.log(error);
        res.render("error", {
            title: "Error Data",
            error
        });
    }
});

router.get("/news/edit/:id", checkAdmin, async (req, res) => {
    let data = await newsModel.findById(req.params.id).exec();
    res.render("backend/news/add", {
        data
    });
});

router.post("/news/edit/:id", checkAdmin, multipartMiddleware, async (req, res) => {
    try {
        req.checkBody("nameNews", '"Tên bài viết" không được để trống').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            let data = await newsModel.findById(req.params.id).exec();
            return res.render("backend/news/add", {
                data,
                errors
            });
        }
        let checkDataExists = await newsModel.findOne({
            $and: [{
                alias: alias(req.body.nameNews)
            }, {
                _id: {
                    $ne: req.params.id
                }
            }]
        }).exec();
        if (checkDataExists) {
            req.flash("error_msg", "Tên bài viết đã tồn tại");
            return res.redirect("/admin/news/edit/" + req.params.id);
        }
     
        let newsData = await newsModel.findById(req.params.id).exec();
        newsData.nameNews = req.body.nameNews;
        newsData.descriptionNews = req.body.descriptionNews;
        newsData.detailNews = req.body.detailNews;
        newsData.typeNews = req.body.typeNews;
        newsData.aliasUrl = alias(req.body.nameNews);
        newsData.status = req.body.status;
        newsData.save(() => {
            req.flash("success_msg", "Đã Sửa Thành Công");
            res.redirect("/admin/news/edit/" + req.params.id);
        })
    } catch (error) {
        console.log(error);
        res.render("error", {
            title: "Error Data",
            error
        });
    }
});

/// Delete one or multi product search
router.post("/news/del", checkAdmin, multipartMiddleware,async (req, res) => {
    try {
        var arrId = req.body;
        (async () => {
            arrId.forEach(async item => {
                let dataNews = await newsModel.findById(item).exec();
                if (dataNews) {
                    newsModel.findById(item).deleteOne().then(() => {
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