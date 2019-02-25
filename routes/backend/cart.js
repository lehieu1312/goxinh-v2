var express = require('express');
var router = express.Router();
var moment = require('moment');
let checkAdmin = require('../../common/helper');
var CartModel = require('../../models/carts');

router.get('/carts', checkAdmin, (req, res) => {
    try {
        CartModel.find().sort({
            dateCreate: -1
        }).then((data) => {
            console.log(data);
            res.render('backend/carts', {
                title: 'Đơn hàng',
                data,
                moment
            });
        })
    } catch (error) {
        console.log(error);
    }

});

router.get('/view/:id', checkAdmin, (req, res) => {
    try {

        CartModel.findOne({
            _id: req.params.id
        }).then((data) => {
            console.log('data: ' + data);
            if (data)
                res.render('admin/cart/view', {
                    title: 'Chi tiết đơn hàng',
                    data,
                    moment
                });
            else
                res.render('404', {
                    title: 'Not data'
                });
        })
    } catch (error) {
        console.log('error: ' + error);
        res.render('404', {
            title: 'Not data'
        });
    }

});
router.get('/del/:id', checkAdmin, function (req, res) {
    try {
        CartModel.findById(req.params.id, function (err, data) {
            data.remove(function () {
                req.flash('success_msg', 'Đã Xoá Thành Công');
                res.redirect('/admin/carts');
            })
        });

    } catch (error) {
        req.flash('error_msg', 'Xoá Không Thành Công: ' + error + '');
        res.redirect('/admin/cart/list.html');
    }

});

module.exports = router;