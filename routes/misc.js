/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * These are miscellaneous routes. For example,
 * the routes that handle the AJAX request for click data.
 * When someone clicks a document, I record the event to keep track
 * of the most-used documents and most-used operating system.
 * Currently, those are the only miscellanous routes.
 */

'use strict';

var express = require("express");
var router = express.Router();

// Models
var Click = require("../models/Click");
	
	
// Useful Functions
var authTools = require("../authTools");

	
router.post("/click", (req, res)=>{
	if(req.body.what && req.body.os)
	{
		Click.find({what: req.body.what}, (err, found)=>{
			if (!found || found.length < 1) {
				var newClick = {
					what: req.body.what,
					operating_systems: [req.body.os],
					total: 1
				}	
				Click.create(newClick)
					 .then(click=>{
					 	console.log(`Created click object ${click.what}`);
					 	console.log(click.what, click.operating_systems[0], click.total);
					 	res.send("success");
					 })
			}
			else if (err){
				console.log(err);
				res.send("error");
			}
			else {
				console.log(found);
				found[0].total++;
				found[0].operating_systems.push(req.body.os);
				found[0].save()
					 .then(()=>{
					 	console.log(found[0].what, req.body.os, found[0].total);
						res.send("success");
					 })
					 .catch((err)=>{
					 	console.log(err);
					 	res.send("error");
					 })
				}
		})
		
	} else {
		res.send("error");
	}
})

router.get("/clicks", authTools.isLoggedIn, (req, res)=>{
	Click.find({})
		 .then(clicks=>{
		 	res.render("clicks", {clicks:clicks} );
		 })
})

module.exports = router;