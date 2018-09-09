var express = require('express');
var router = express.Router();
var NewsModel = require('../../models/news');
var AliasUrlModel = require('../../models/aliasurl');

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


router.get('/list.html', checkAdmin, (req, res) => {
    NewsModel.find().then((data) => {
        console.log(data);
        res.render('admin/news/list', { data: data });
    })
});
router.get('/add.html', checkAdmin, (req, res) => {
    res.render('admin/news/add', { errors: null });
});
router.post('/add.html', checkAdmin, (req, res) => {
    req.checkBody('name', 'Giá trị tên không được để trống').notEmpty();
    req.checkBody('title', 'Giá trị tiêu đề không được để trống').notEmpty();
    req.checkBody('description', 'Giá trị mô tả không được để trống').notEmpty();
    req.checkBody('detail', 'Giá trị nội dung không được để trống').notEmpty();
    // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
    var errors = req.validationErrors();
    if (errors) {
        return res.render('admin/news/add', { errors: errors });
    } else {
        AliasUrlModel.findOne({ aliasUrl: bodauTiengViet(req.body.title) }).exec((error, kq) => {
            if (error) {
                req.flash('error_msg', error + '');
                return res.redirect('/admin/news/add.html');
            }
            console.log(kq);
            if (kq) {
                req.flash('error_msg', 'Alias url đã tồn tại.');
                return res.redirect('/admin/news/add.html');

            }
            NewsModel.findOne({ namNews: req.body.name }).exec((err, result) => {
                if (err) {
                    console.log(err);
                    req.flash('error_msg', 'Error Find Database');
                    return res.redirect('/admin/news/add.html');
                }
                if (result) {
                    console.log('Đã tồn tại');
                    req.flash('error_msg', 'Tên đã tồn tại');
                    return res.redirect('/admin/news/add.html');
                    // return req.flash('error_msg', 'Danh mục đã tồn tại!');
                    // return done(null, false, { error_msg: 'Danh mục đã tồn tại!' });
                } else {
                    console.log('check xong!');
                    var newsData = new NewsModel({
                        nameNews: req.body.name,
                        aliasUrl: bodauTiengViet(req.body.title),
                        titleNews: req.body.title,
                        descriptionNews: req.body.description,
                        detailNews: req.body.detail,
                        typeNews: req.body.type,
                        dateCreate: Date.now(),
                        status: req.body.statusradio
                    });
                    newsData.save().then((idN) => {
                        console.log(idN);
                        var AliasU = new AliasUrlModel({
                            aliasUrl: bodauTiengViet(req.body.title),
                            type: 'news',
                            idParent: idN._id,
                            status: 1
                        });
                        AliasU.save().then(() => {
                            req.flash('success_msg', 'Đã Thêm Thành Công');
                            return res.redirect('/admin/news/list.html');
                        })
                    })
                }
            });
        });
    }
});
router.get('/edit/:id', checkAdmin, (req, res) => {
    console.log(req.params.id);
    NewsModel.findOne({ _id: req.params.id }, function(err, data) {
        if (err) {
            console.log(err);
            req.flash('error_msg', 'Lỗi triết xuất dữ liệu');
            return res.redirect('/admin/news/list');
        }
        console.log('data: ' + data);
        res.render('admin/news/edit', { errors: null, data: data });
    })
});
router.post('/edit/:id', checkAdmin, (req, res) => {
    req.checkBody('name', 'Giá trị tên không được để trống').notEmpty();
    req.checkBody('title', 'Giá trị tiêu đề không được để trống').notEmpty();
    req.checkBody('description', 'Giá trị mô tả không được để trống').notEmpty();
    req.checkBody('detail', 'Giá trị nội dung không được để trống').notEmpty();
    // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
    var errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/admin/news/edit/' + req.params.id);
    } else {
        NewsModel.findById(req.params.id, function(err, dataOneNews) {
            if (err) {
                console.log(err);
                req.flash('error_msg', 'Lỗi triết xuất dữ liệu');
                return res.redirect('/admin/news/edit/' + req.params.id);
            }
            AliasUrlModel.find({ $and: [{ aliasUrl: bodauTiengViet(req.body.title) }, { aliasUrl: { $ne: dataOneNews.aliasUrl } }] }, function(err, dataFindAlias) {
                if (err) {
                    console.log(err);
                    req.flash('error_msg', 'Error find Database');
                    return res.redirect('/admin/news/edit/' + req.params.id);
                }
                if (dataFindAlias != '') {
                    req.flash('error_msg', 'Alias url đã tồn tại.');
                    return res.redirect('/admin/news/edit/' + req.params.id);
                } else {
                    dataOneNews.nameNews = req.body.name;
                    dataOneNews.titleNews = req.body.title;
                    dataOneNews.aliasUrl = bodauTiengViet(req.body.title);
                    dataOneNews.descriptionNews = req.body.description;
                    dataOneNews.detailNews = req.body.detail;
                    dataOneNews.status = req.body.statusradio;
                    dataOneNews.typeNews = req.body.type;
                    dataOneNews.save().then((oneProduct) => {
                        AliasUrlModel.findOne({ idParent: req.params.id }, (err, dataAlias) => {
                            if (err) {
                                console.log(err);
                                req.flash('error_msg', 'Lỗi cập nhật alias url');
                                return res.redirect('/admin/news/edit/' + req.params.id);
                            }
                            dataAlias.aliasUrl = bodauTiengViet(req.body.title);
                            dataAlias.save();
                            console.log('success');
                            req.flash('success_msg', 'Đã Sửa Thành Công');
                            return res.redirect('/admin/news/list.html');
                        });
                    });
                }
            });
        });
    }
});
router.get('/del/:id', checkAdmin, (req, res, next) => {

    NewsModel.findOne({ _id: req.params.id }).remove(function() {
        AliasUrlModel.findOne({ idParent: req.params.id, type: 'news' }).remove((err) => {
            if (err) {
                console.log(err + '');
                req.flash('error_msg', 'Xóa lỗi ' + err + '');
                return res.redirect('/admin/catnewsegory/list.html');
            }
            req.flash('success_msg', 'Đã Xoá Thành Công');
            res.redirect('/admin/news/list.html');
        })

    });
});

function checkAdmin(req, res, next) {

    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/admin/dang-nhap.html');
    }
}
module.exports = router;