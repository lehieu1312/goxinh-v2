let express = require("express");
let router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var userModel = require("../../models/users");
var md5 = require("md5");
var multer = require('multer');
var fs = require('fs')
var path = require('path')
var crypto = require('crypto');
let checkAdmin = require('../../common/helper');


router.get("/", checkAdmin, (req, res) => {
  console.log('vao day');
  res.render("backend/index");
});

router.get("/login", function (req, res, next) {
  res.render("backend/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
    failureFlash: true
  })
);
passport.use(
  new LocalStrategy({
      usernameField: "email",
      passwordField: "password"
    },

    function (username, password, done) {
      userModel
        .findOne({
          $and: [{
            email: username
          }, {
            isAdmin: true
          }, {
            status: true
          }]
        })
        .exec((err, data) => {
          if (err) {
            console.log(err);
            return done(null, false, {
              message: "Error: " + err + ""
            });
          }
          console.log('data', data);
          if (data) {
            var iPassword = md5(password);
            if (data.password == iPassword) {
              return done(null, data);
            } else {
              return done(null, false, {
                message: "Tài Khoảng Không Đúng"
              });
            }
          } else {
            return done(null, false, {
              message: "Tài Khoảng Không Đúng"
            });
          }
        });
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

router.post("/getUser", checkAdmin, function (req, res) {
  res.json(req.user);
});

router.get("/logout", checkAdmin, function (req, res) {
  req.logout();
  res.redirect("/admin/login");
});


module.exports = router;