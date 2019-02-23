var express = require('express');
var router = express.Router();
var moment = require('moment');
var OrderBuyProductModel = require('../../models/orderbuyproduct');

router.get('/list.html', checkAdmin, (req, res) => {
    try {
        OrderBuyProductModel.find().sort({
            dateCreate: -1
        }).then((data) => {
            console.log(data);
            res.render('admin/cart/list', {
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

        OrderBuyProductModel.findOne({
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
        OrderBuyProductModel.findById(req.params.id, function (err, data) {
            data.remove(function () {
                req.flash('success_msg', 'Đã Xoá Thành Công');
                res.redirect('/admin/cart/list.html');
            })
        });

    } catch (error) {
        req.flash('error_msg', 'Xoá Không Thành Công: ' + error + '');
        res.redirect('/admin/cart/list.html');
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