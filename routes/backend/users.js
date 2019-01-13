let express = require("express");
let router = express.Router();
var usersModel = require("../../models/users");
var md5 = require("md5");
var path = require("path");
var fse = require("fs-extra");
var fs = require("fs");
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
var appRoot = require("app-root-path");
appRoot = appRoot.toString();

router.get("/users", checkAdmin, async (req, res) => {
    let usersData = await usersModel.find().exec();
    res.render("backend/users/index", {
        usersData
    });
});
router.get("/users/add", checkAdmin, async (req, res) => {
    // let usersData = await usersModel.find().exec();nodem
    let userData = new usersModel({});
    let permisionData = await permissionModel.find().exec();

    res.render("backend/users/add", {
        userData,
        permisionData
    });
});

router.post("/users/add", checkAdmin, async (req, res) => {
    try {
        req.checkBody("txtTaikhoan", '"Tài khoản" không được để trống').notEmpty();
        req.checkBody("txtMatkhau", '"Mật khẩu" không được để trống').notEmpty();
        req.check('txtNhaplaimatkhau', 'Mật khẩu nhập lại không đúng').equals(req.body.txtMatkhau);
        var errors = req.validationErrors();
        if (errors) {
            let usersData = await usersModel.find().exec();
            return res.render("backend/users/add", {
                usersData,
                errors
            });
        }
        let usserCheckExist = await usersModel.findOne({
            email: req.body.txtTaikhoan
        }).exec();
        if (usserCheckExist) {
            req.flash("error_msg", "Tài khoản đã tồn tại");
            return res.redirect("/admin/users/add");
        }
        var userData = new usersModel({
            id: md5(new Date()),
            email: req.body.txtTaikhoan,
            fullName: req.body.txtHoten,
            password: md5(req.body.txtMatkhau),
            phoneNumber: req.body.txtSodienthoai,
            address: req.body.txtDiachi,
            avatar: '',
            dateCreate: Date.now(),
            permision: req.body.slNhomQuyen,
            isAdmin: req.body.optLoaitaikhoan,
            status: req.body.status
        })
        userData.save().then(() => {
            req.flash("success_msg", "Đã Thêm Thành Công");
            res.redirect("/admin/users/add");
        })
    } catch (error) {
        console.log(error);
        res.render("error", {
            title: "Error Data",
            error
        });
    }
});

router.get("/users/edit/:id", checkAdmin, async (req, res) => {
    let userData = await usersModel.findOne({
        id: req.params.id
    }).exec();
    let permisionData = await permissionModel.find().exec();
    res.render("backend/users/add", {
        userData,
        permisionData
    });
});

router.post("/users/edit/:id", checkAdmin, async (req, res) => {
    try {
        req.check('txtNhaplaimatkhau', 'Mật khẩu nhập lại không đúng').equals(req.body.txtMatkhau);
        var errors = req.validationErrors();
        if (errors) {
            let userData = await usersModel.findOne({
                id: req.params.id
            }).exec();
            return res.render("backend/users/add", {
                userData,
                errors
            });
        }
        let userData = await usersModel.findOne({
            id: req.params.id
        }).exec();
        if (req.body.txtMatkhau != '') {
            userData.password = md5(req.body.txtMatkhau);
        }

        userData.fullName = req.body.txtHoten;
        userData.phoneNumber = req.body.txtDienthoai;
        userData.address = req.body.txtDiachi;
        userData.permision = req.body.slNhomQuyen;
        userData.isAdmin = req.body.optLoaitaikhoan;
        userData.status = req.body.status;

        userData.save(() => {
            req.flash("success_msg", "Đã Sửa Thành Công");
            res.redirect("/admin/users/edit/" + req.params.id);
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
router.post(
    "/users/del",
    checkAdmin,
    multipartMiddleware,
    (req, res) => {
        try {
            var arrId = req.body;
            (async () => {
                arrId.forEach(async item => {
                    console.log(item);
                    let dataUser = await usersModel.findOne({
                        id: item
                    });
                    if (dataUser) {
                        usersModel.findOne({
                                id: item
                            })
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
                status: false,
                msg: error + ""
            });
        }
    }
);

function checkAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/admin/login");
    }
}

module.exports = router;