'use strict';

// Dependencies

var express = require("express"),
	compression = require('compression'),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose");


var app = express();
app.use(compression());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/notmoodle");


app.get('*', function(req, res) {
	res.render("404");
});


app.listen(3000, function() {
	console.log("Starting server...");
});