//requirements ===========================================================================================
let express = require('express'); 
let bodyParser = require('body-parser');
let exphbs = require('express-handlebars');
var db = require("./models");
let cheerio = require('cheerio'); 
let mongoose = require('mongoose');
let PORT = process.env.PORT || 8080;
let app = express();
//middleware==============================================================================================
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//define static content
app.use(express.static("public"));
//use handlebars as the engine for temlating
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Routes requirement=======================================================================================
require("./controllers/webScrapperController.js")(app);
//set server to listen ====================================================================================
app.listen(PORT, ()=>{
    console.log(`App listening on PORT ${PORT}`);
})