/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * The site was originally made for use in MECH 215 at Concordia University,
 * for which I was the TA, to communicate with students. At the time, I wasn't
 * sure it would be useful, so I threw together the site in a weekend. 
 * Therefore, there are some hard-coded MECH215 routes that I didn't 
 * generalize from the start.
 */

'use strict';

var express = require("express"),
    router  = express.Router(),
    mongoose = require("mongoose"),
	passport = require("passport");

// Models
var Post = require("../models/Post"),
	Thread = require("../models/Thread"),
	User = require("../models/User");
	
/* * * * * *
 * MECH215 *
 * * * * * */
 
router.get('/mech215', function(req,res) {
	res.redirect('/mech215/2019/winter');
})


router.get('/mech215/:year/:semester', function(req, res) {
	var y = parseInt(req.params.year);
	var semester = (req.params.semester).toLowerCase();
	if (y < 2018 || y > 2019) res.redirect('/404');
	else if (semester != "fall" && semester != "winter" && semester != "summer") 
		res.redirect('/404');
	else{
		Thread.find({
			"topic": "mech215",
			"semester": semester,	
			"timestamp": {         
				$gte: new Date(y,0,1),         
				$lt: new Date((y+1),0,1)
			}
			}).sort('-date').exec((err, foundThreads)=>{
			if (err) {
				console.log(err);
				res.redirect("/404");
			}
			var threads = foundThreads.reverse();
			// console.log(threads);
			if (req.isAuthenticated() && req.user.admin)
				res.render("index", {topic: 'mech215', threads: threads, user: req.user.username, admin: true});
			else res.render("index", {topic: 'mech215', threads: threads, user: "", admin: false});
		});
	}
});


module.exports = router;