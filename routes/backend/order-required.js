var express = require('express');
var router = express.Router();
var moment = require('moment');
var OrderRequiredModel = require('../../models/order-required');
let checkAdmin = require('../../common/helper');

router.get('/order-required', checkAdmin, (req, res) => {
    try {
        OrderRequiredModel.find().sort({ dateCreate: -1 }).then((data) => {
            console.log(data);
            res.render('backend/order-required', { data ,moment});
        })
    } catch (error) {
        console.log(error);
        res.render('errror', { title: 'Error Data', error: error });
    }
});

router.get('/order-required/edit/:id', checkAdmin, (req, res, next) => {
    try {
        OrderRequiredModel.findById(req.params.id).then(function(data) {
            console.log(data);
            res.render('backend/order-required/edit', {data, moment, errors: null });
        });
    } catch (error) {
        console.log(error);
        res.render('error', { title: 'Error Data', error: error });
    }
});
router.post('/order-required/edit/:id', checkAdmin, (req, res) => {
    try {
        req.checkBody('name', 'Giá trị tên không được để trống').notEmpty();
        req.checkBody('email', 'Giá trị tiêu đề không được để trống').notEmpty();
        req.checkBody('email', 'Email nhập không đúng').isEmail();
        req.checkBody('phoneNumber', 'Giá trị mô tả không được để trống').notEmpty();
        req.checkBody('phoneNumber', 'Số điện thoại phải là số').isNumeric();
        req.checkBody('content', 'Giá trị nội dung không được để trống').notEmpty();
        // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
        var errors = req.validationErrors();
        if (errors) {
            console.log(errors);
            OrderRequiredModel.find().then((data) => {
                console.log(data);
                res.render('backend/order-required/edit', { errors: errors, data });
            })
        }
        OrderRequiredModel.findById(req.params.id).then((dataOne) => {
            dataOne.name = req.body.name;
            dataOne.email = req.body.email;
            dataOne.phoneNumber = req.body.phoneNumber;
            dataOne.content = req.body.content;
            dataOne.Notes = req.body.notes;
            dataOne.status = req.body.status;
            dataOne.save().then((oneProductOrder) => {
                req.flash('success_msg', 'Đã Sửa Thành Công');
                return res.redirect('/admin/order-required/');
            })
        });

    } catch (error) {
        console.log(error);
        res.render('error', { title: 'Error Data', error: error });
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



module.exports = router;