/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * NOT Moodle.
 * I made this site so I could communicate with my students during my time
 * as a TA for MECH 215 (Intro to C++). 
 * Concordia usually uses Moodle, but I didn't have access
 * and even if I did people wouldn't take it seriously. Moodle is horrendous.
 * The only way was to go rogue.
 */

'use strict';

var express = require("express"),
	compression = require("compression"),
	bodyParser = require("body-parser"),
	passport = require("passport"),
	mongoose = require("mongoose"),
	async = require("async");


var app = express();
app.use(compression());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set("view engine", "ejs");

// Models
var Post = require("./models/Post"),
	Thread = require("./models/Thread"),
	User = require("./models/User"),
	Click = require("./models/Click");
	
// Routes
var mechRoutes = require("./routes/mech215"),
	forumRoutes = require("./routes/forum"),
	authRoutes = require("./routes/auth"),
	miscRoutes = require("./routes/misc");


// Initialize everything
var LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose");
	
app.use(require("express-session")({
	secret: process.env.s,
	resave: false,
	saveUninitialized: false
}));

// console.log(process.env.s);
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.Promise = global.Promise;  
mongoose.connect("mongodb://localhost/notmoodle", { useNewUrlParser: true });

// Done initializing everything

// Declare routes (careful with the order)

app.get('/', function(req,res) {
	res.redirect('/mech215/2019/fall');
})

app.use(mechRoutes);

app.get('/404', function(req, res) {
	res.render("404");
});

app.use(authRoutes);
app.use(miscRoutes);
app.use(forumRoutes); // forum routes have to go last because of /:topic/

app.get('*', function(req, res) {
	res.render("404");
});


app.listen(3000, function() {
	console.log("Starting server...");
});
