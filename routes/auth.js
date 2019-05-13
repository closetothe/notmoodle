/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * These routes are responsible for the (minimal) auth in the site.
 * The only users are admins, and the only admin is me. This just lets me
 * log in to edit and delete posts.
 */

'use strict';

var express = require("express"),
    router  = express.Router(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
	passport = require("passport");

// Models
var Post = require("../models/Post"),
	Thread = require("../models/Thread"),
	User = require("../models/User");

// Useful Functions
var authTools = require("../authTools");

router.get("/login", authTools.isNotLoggedIn, (req, res)=>{
	res.render("login");
})

router.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    }), (req, res)=>{
  
})

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});



// router.get("/signup", isNotLoggedIn, (req, res)=>{
// 	res.render("signup");
// })

// router.post("/signup", isNotLoggedIn, (req, res) => {
    
//     // In case someone messes with the jquery
//     if (!req.body.password || !req.body.username){
//         res.redirect("/signup");
//     } else {
//         // Generate new Waves address
//      var newUser = {
//         username: req.body.username,
// 		admin: true
//     };
    
  
// 	User.register(new User(newUser), req.body.password, (err, user) => {
//                                                 if(err){
//                                                     var msg;
//                                                     if (err.name === "UserExistsError") msg = "exists"
//                                                     else msg = err
//                                                     console.log("ERROR adding new user", msg);
//                                                     res.redirect("/error")
//                                                 }
//                                                 else {
//                                                     console.log("Created new user", user.username);
//                                                     res.redirect("/login");
//                                                 } 
//                                             })    
    
//     }
// });

module.exports = router;