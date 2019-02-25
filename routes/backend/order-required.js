var express = require('express');
var router = express.Router();
var moment = require('moment');
var OrderRequiredModel = require('../../models/order-required');

router.get('/order-required', checkAdmin, checkAdmin, (req, res) => {
    try {
        OrderRequiredModel.find().sort({ dateCreate: -1 }).then((data) => {
            console.log(data);
            res.render('backend/productorder/list', { data: data });
        })
    } catch (error) {
        console.log(error);
        res.render('errror', { title: 'Error Data', error: error });
    }
});

router.get('/order-required/edit/:id', checkAdmin, (req, res, next) => {
    try {
        OrderRequiredModel.findOne({ _id: req.params.id }).then(function(dataOne) {
            console.log(dataOne);
            // req.flash('success_msg', 'Đã Xoá Thành Công');
            res.render('admin/productorder/edit', { errors: null, dataOne: dataOne, moment: moment });
        });
    } catch (error) {
        console.log(error);
        res.render('errror', { title: 'Error Data', error: error });
    }
});
router.post('/order-required/edit/:id', checkAdmin, (req, res) => {
    try {
        req.checkBody('name', 'Giá trị tên không được để trống').notEmpty();
        req.checkBody('email', 'Giá trị tiêu đề không được để trống').notEmpty();
        req.checkBody('email', 'Email nhập không đúng').isEmail();
        req.checkBody('phonenumber', 'Giá trị mô tả không được để trống').notEmpty();
        req.checkBody('phonenumber', 'Số điện thoại phải là số').isNumeric();
        req.checkBody('content', 'Giá trị nội dung không được để trống').notEmpty();
        // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
        var errors = req.validationErrors();
        if (errors) {
            console.log(errors);
            OrderRequiredModel.find().then((data) => {
                console.log(data);
                res.render('admin/productorder/edit', { errors: errors, data: data });
            })
        }
        OrderRequiredModel.findById(req.params.id).then((dataOne) => {
            console.log(dataOne);
            dataOne.name = req.body.name;
            dataOne.email = req.body.email;
            dataOne.phoneNumber = req.body.phonenumber;
            dataOne.content = req.body.content.trim();
            dataOne.Notes = req.body.notes.trim();
            dataOne.status = req.body.statusradio;
            dataOne.save().then((oneProductOrder) => {
                req.flash('success_msg', 'Đã Sửa Thành Công');
                return res.redirect('/admin/product-order/list.html');
            })
        });

    } catch (error) {
        console.log(error);
        res.render('errror', { title: 'Error Data', error: error });
    }
});
router.get('/del/:id', checkAdmin, (req, res, next) => {
    try {
        OrderRequiredModel.findOne({ _id: req.params.id }).remove(function() {
            req.flash('success_msg', 'Đã Xoá Thành Công');
            res.redirect('/admin/product-order/list.html');
        });
    } catch (error) {
        console.log(error);
        res.render('errror', { title: 'Error Data', error: error });
    }
});

function checkAdmin(req, res, next) {

    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

module.exports = router;