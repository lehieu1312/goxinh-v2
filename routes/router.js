let express = require("express");
let path = require("path");
let fs = require("fs");
var appRoot = require("app-root-path");
appRoot = appRoot.toString();
/**
 * Create Express server.
 */
const app = express();
app.disable("etag");

const arrRouter = fs.readdirSync(path.join(appRoot, "routes", "font-end"));
arrRouter.map(file => {
    app.use("/", require(`./font-end/${file}`));
});

const arrRouterBackend = fs.readdirSync(
    path.join(appRoot, "routes", "backend")
);

arrRouterBackend.map(file => {
    app.use("/admin", require(`./backend/${file}`));
});

module.exports = app;