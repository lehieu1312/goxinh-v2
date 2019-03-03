var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session"),
  expressValidator = require("express-validator"),
  fs = require("fs"),
  fse = require("fs-extra"),
  http = require("http"),
  mongoose = require("mongoose"),
  nodemailer = require("nodemailer"),
  moment = require("moment");
var timeout = require("connect-timeout");
var flash = require("connect-flash");
var async = require("async");
var debug = require("debug")("appbuild:server");
var appRoot = require("app-root-path");
appRoot = appRoot.toString();


var passport = require("passport");
var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

var port = normalizePort(process.env.PORT || "3018");
app.set("port", port);
// app.set('devMode', true);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
server.timeout = 1500000;

mongoose.Promise = require("bluebird");
//"mongodb://uer:pass@ip/db_mongo"
//'mongodb://127.0.0.1/deployapp'
mongoose.connect("mongodb://127.0.0.1/goxinh", {
  poolSize: 20,
  socketTimeoutMS: 480000,
  useMongoClient: true,
  keepAlive: 300000,
  connectTimeoutMS: 300000,
  reconnectTries: 30,
  reconnectInterval: 3000
});
var dbMongo = mongoose.connection;

dbMongo.on("error", function (err) {
  console.log(err);
});
dbMongo.on("open", function () {
  console.log("Mongodb conected");
});

io.on("connection", function (socket) {
  console.log(
    "co nguoi ket noi: " +
    socket.id +
    " ---> " +
    moment(Date.now()).format("DD-MM-YYYY, HH:mm:ss")
  );
});

var index = require("./routes/font-end/index");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(timeout(1500000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "lemanhhieu",
    resave: true,
    key: "user",
    saveUninitialized: true
  })
);
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.errors = req.flash("errors");
  res.locals.title = "Goxinh.net";
  res.locals.descriptions ="Nội thất gỗ xinh, nội thất phòng khách, gỗ nội thất";
  sess=req.session;
  next();
});

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "webgovn"
}));

// Import router fontend and backend
let routerFontEnd = require("./routes/router");
app.use("/", routerFontEnd);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  err.message = 404;
  // next(err);
  res.render("404", {
    title: "Page Not Found"
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error", {
    title: "Page Not Found"
  });
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
  debug("Listening on " + bind);
}
module.exports = app;