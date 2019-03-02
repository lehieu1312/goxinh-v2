

module.exports =  checkAdmin = (req, res, next)=> {
    // next();
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/admin/login");
    }
}


