var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/user');
var bcrypt = require('bcryptjs');
var md5 = require('md5');
var async = require('async');


router.get('/', checkAdmin, function(req, res, next) {
    res.render('admin/main/index');
});

router.get('/dang-nhap.html', function(req, res, next) {
    res.render('admin/login/index');
});


// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//         done(err, user);
//     });
// });
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
router.post('/dang-nhap.html',
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/admin/dang-nhap.html',
        failureFlash: true
    })
);
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },

    function(username, password, done) {
        User.findOne({ email: username }).exec((err, data) => {
            if (err) {
                console.log(err);
                return done(null, false, { message: 'Error: ' + err + '' });
            }
            if (data) {
                console.log(data);
                var iPassword = md5(password);
                // console.log(iPassword);
                // console.log(data.password);
                if (data.password == iPassword) {
                    // console.log('1');
                    return done(null, data);
                } else {
                    return done(null, false, { message: 'Tài Khoảng Không Đúng' });
                }
            } else {
                return done(null, false, { message: 'Tài Khoảng Không Đúng' });
            }
        });
    }

));
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

router.post('/getUser', checkAdmin, function(req, res) {
    res.json(req.user);
});

router.get('/dang-xuat.html', checkAdmin, function(req, res) {
    req.logout();
    res.redirect('/admin/dang-nhap.html');
});

function checkAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/admin/dang-nhap.html');
    }
}
module.exports = router;