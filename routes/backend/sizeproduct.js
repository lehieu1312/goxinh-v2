var express = require('express');
var router = express.Router();
var SizeProductModel = require('../../models/sizeproduct');
var ProductModel = require('../../models/product');

router.get('/list.html', checkAdmin, (req, res) => {
    try {
        SizeProductModel.aggregate([{
            $lookup: {
                from: "product", // other table name
                localField: "idProduct", // name of users table field
                foreignField: "_id", // name of userinfo table field
                as: "product" // alias for userinfo table
            }
        }]).then(function(pro) {
            // console.log(pro);
            // console.log(pro[0].product[0].nameProduct);
            // console.log(data);
            res.render('admin/sizeproduct/list', { data: pro });
        });
        // SizeProductModel.find().then((data) => {
        //     console.log(data);
        //     res.render('admin/sizeproduct/list', { data: data });
        // })
    } catch (error) {

    }

});
router.get('/add.html', checkAdmin, (req, res) => {
    ProductModel.find({ productSync: false }).then((data) => {
        console.log(data);
        res.render('admin/sizeproduct/add', { errors: null, data: data });
    })
});

router.post('/add.html', checkAdmin, (req, res) => {
    try {
        req.checkBody('length', 'Giá trị chiều dài không được để trống').notEmpty();
        req.checkBody('width', 'Giá trị chiều rộng không được để trống').notEmpty();
        req.checkBody('height', 'Giá trị chiều cao không được để trống').notEmpty();
        req.checkBody('price', 'Giá trị giá không được để trống').notEmpty();
        // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
        var errors = req.validationErrors();
        if (errors) {
            console.log(errors);
            return res.render('admin/sizeproduct/add.html', { errors: errors });
        }
        var sizePro = new SizeProductModel({
            sizeLength: req.body.length,
            sizeWidth: req.body.width,
            sizeHeight: req.body.height,
            idProduct: req.body.product,
            priceProduct: req.body.price,
            status: req.body.statusradio
        });
        sizePro.save().then(function() {
            req.flash('success_msg', 'Đã Thêm Thành Công');
            ProductModel.find({ productSync: false }).then((data) => {
                    console.log(data);
                    res.redirect('/admin/size-product/list.html');
                })
                // return res.redirect('/admin/size-product/list.html');
        })
    } catch (error) {
        console.log(error);
        req.flash('error_msg', 'Lỗi: ' + error + '');
        res.redirect('/admin/size-product/add.html');
    }
});
router.get('/edit/:id', checkAdmin, function(req, res, next) {
    try {
        SizeProductModel.findOne({ _id: req.params.id }).then((data) => {
            ProductModel.find({ productSync: false }).then((dataPro) => {
                res.render('admin/sizeproduct/edit', { errors: null, data: data, dataPro: dataPro });
            });
        });
    } catch (error) {
        console.log(error);
        req.flash('error_msg', 'Lỗi: ' + error + '');
        res.redirect('/admin/size-product/list.html');
    }
});
router.post('/edit/:id', checkAdmin, function(req, res, next) {
    try {
        req.checkBody('length', 'Giá trị chiều dài không được để trống').notEmpty();
        req.checkBody('width', 'Giá trị chiều rộng không được để trống').notEmpty();
        req.checkBody('height', 'Giá trị chiều cao không được để trống').notEmpty();
        req.checkBody('price', 'Giá trị giá không được để trống').notEmpty();
        // req.checkBody('name', 'Name 5 đến 32 ký tự').isLength({ min: 3, max: 32 });
        var errors = req.validationErrors();
        if (errors) {
            console.log(errors);
            req.flash('errors', errors);
            return res.redirect('/admin/size-product/edit.html');
        }

        SizeProductModel.findOne({ _id: req.params.id }).then((data) => {
            data.sizeLength = req.body.length;
            data.sizeWidth = req.body.width;
            data.sizeHeight = req.body.height;
            data.idProduct = req.body.product;
            data.priceProduct = req.body.price;
            data.status = req.body.statusradio;
            data.save().then(() => {
                    req.flash('success_msg', 'Sửa thành công');
                    return res.redirect('/admin/size-product/list.html');
                })
                // ProductModel.find({ productSync: false }).then((dataPro) => {
                //     res.render('admin/sizeproduct/edit', { errors: null, data: data, dataPro: dataPro });
                // });
        });
    } catch (error) {
        console.log(error);
        req.flash('error_msg', 'Lỗi: ' + error + '');
        res.redirect('/admin/size-product/list.html');
    }
});

router.get('/del/:id', checkAdmin, function(req, res, next) {
    try {
        SizeProductModel.findOne({ _id: req.params.id }).remove(function() {
            req.flash('success_msg', 'Đã Xoá Thành Công');
            res.redirect('/admin/size-product/list.html');
        });
    } catch (error) {
        req.flash('error_msg', 'Lỗi: ' + error + '');
        res.redirect('/admin/size-product/list.html');
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