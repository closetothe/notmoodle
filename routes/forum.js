/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * These routes are generic 'forum' routes
 * (i.e. CRUD operations for posts and threads)
 * that were refactored from the original mech215-only site.
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
var mailTools = require("../mailTools"),
    forumTools = require("../forumTools"),
    authTools = require("../authTools");

const url = "https://www.notmoodle.com";
const topics = require("../topics");

// Create-thread page. 
// Topic refers to the forum in question (e.g. mech215)

router.get('/:topic/create', function(req,res) {
	let topic = req.params.topic;
	res.render("create", {topic: topic});
});


// Actually create the thread in the database

router.post('/:topic/create', function(req, res) {
	var resp = {};
	var topic = req.params.topic;
	console.log(topic);
	if (!topics.has(topic)) res.redirect('404');
	if (!req.body.title || !req.body.author || !req.body.content) {	
		res.send('error');
	} else if (!req.isAuthenticated() && !forumTools.sanitizeAdmin(req.body.author)) {
		res.send('error');
	} else if (req.isAuthenticated() && !req.user.admin && !forumTools.sanitizeAdmin(req.body.author)) {
		res.send('error');
	}
	else {
    	var newPost = {};
    	newPost.thread = [];
    	newPost.children = [];
    	newPost.parent = [];
    	newPost.author = req.body.author;
    	newPost.body = req.body.content;
    	newPost.admin = false;
    	newPost.depth = 0;
    
    	if (req.body.email){
    		newPost.email = req.body.email;
    	}
    
    	Post.create(newPost)
    		.then( post => {
    			console.log("Post saved.");
    			console.log(post);
    			var semester = forumTools.determineSemester();
    			var newThread = {
    				title: req.body.title,
    				responses: 0,
    				timestamp: post.timestamp,
    				topic: topic,
    				author: post.author,
    				semester: semester,
    				initializer: [post]
    			}
    
    			Thread.create(newThread)
    				  .then( thread => {
    				  	post.thread.push(thread);
    				  	post.save()
    				  		.then( ()=> {
    				  			console.log("Thread saved.");
    				  			resp.status = "success";
    				  			resp.id = thread._id;
    				  			mailTools.postNotify(`${url}/post/${thread._id}`, post.body, post.author, post.email);
    				  			res.send(resp);
    				  		})
    				  		.catch(err => {
    				  			throw err;
    				  		});
    				  })
    				  .catch( err => {
    				  	throw err;
    				  });
    
    		})
    		.catch( err => {
    			console.log(err);
    			resp.status = 'error';
    			resp.details = err;
    			res.send(resp);
    		});

	}
});

// Show thread. 
// "/post/" should probably be changed to "thread". Confusing.

router.get('/post/:id', function(req, res) {
	var id = req.params.id;
	Thread.findById(id, function(err, thread){
		if (err || thread == null) {
			console.log(err);
			res.redirect("/404");
		}
		else {
			let topic = thread.topic;
			// Prepare thread tree for front-end
			forumTools.getPostPriority(thread.initializer[0], [])
				.then((priority)=>{
					if(req.isAuthenticated())
						res.render("thread", {topic: topic, 
											  title:thread.title, 
											  priority: priority, 
											  user: req.user.username, 
											  admin: req.user.admin});
					else
						res.render("thread", {topic: topic, 
											  title:thread.title, 
											  priority: priority, 
											  user: "", 
											  admin: false});
				})
				.catch( err => {
					console.log(err);
					res.redirect("/");
				})
		}
	})
});


// Create a post within a thread
// Used with AJAX.

router.post('/reply', function(req, res) {
	if (!req.body.thread || !req.body.parent || !req.body.author || !req.body.content)
		res.send("auth");
	else if (!req.isAuthenticated() && !forumTools.sanitizeAdmin(req.body.author)){
		res.send('auth');
	} else if (req.isAuthenticated() && !req.user.admin && !forumTools.sanitizeAdmin(req.body.author)){
		res.send('auth');
	} else {
    	var resp = {};
    	var newPost= {};
    	newPost.thread = [req.body.thread];
    	newPost.parent = [req.body.parent];
    	newPost.author = req.body.author;
    	newPost.body = req.body.content;
    	newPost.admin = false;
    
    	if (req.body.email){
    		newPost.email = req.body.email;
    	}
    
    	Post.create(newPost)
    		.then( post => {
    			console.log("Created new post: ", post);
    			Post.findById(newPost.parent, (err, parentPost)=>{
    				if (err) throw err;
    				parentPost.children.push(post);
    				parentPost.save()
    						  .then( ()=> {
    						  	post.depth = parentPost.depth + 1;
    						  	post.save()
    						  		.then( ()=> {
    						  			resp.status="success"
    								  	resp.id = post._id;
    								  	forumTools.updateResponses(newPost.thread);
    								  	mailTools.postNotify(`${url}/post/${post.thread[0]}#${post._id}`, post.body, post.author, post.email)
    								  	if(parentPost.email)
    								  		mailTools.replyNotify(parentPost.email, `${url}/post/${parentPost.thread[0]}#${parentPost._id}`, post.body, post.author)	
    								  	try {
    								  		res.send(resp)
    								  	}
    								  	catch (err) {
    								  		throw err;
    								  	}
    								  	
    						  		})
    						  		.catch( err => {throw err});
    						  })
    						  .catch( err => {
    						  	console.log(err);
    							resp.status="err";
    							resp.details = err;
    							res.send(resp)
    						  })
    			})
    		})
    		.catch( err => {
    			console.log(err);
    			resp.status="err";
    			resp.details = err;
    			res.send(resp)
    		})
    	
	}

});

// Only an admin can delete a post. 
// Used with AJAX.

router.post("/post/delete/:id", authTools.isLoggedIn, (req, res) => {
	console.log(req.params.id);
	Post.findById(req.params.id)
		.then( post => {
			
			if (post.children.length == 0 && post.parent.length > 0){
				var parent = post.parent[0];
				post.remove()
					.then(()=>{
						Post.findById(parent)
							.then((foundParent)=>{
								var i = foundParent.children.indexOf(req.params.id);
								foundParent.children.splice(i,1);
								foundParent.save()
										   .then(()=>{
										   		Thread.findById(foundParent.thread[0])
										   			  .then(foundThread=>{
										   			    foundThread.responses--;
										   			    foundThread.save()
										   			    		   .then(()=>{
										   			    		   	console.log("Deleted post " + post._id);
										   			    		   	res.send("success");
										   			    		   })
										   			    		   .catch(err=>{throw err})
										   			  })
										   			  .catch(err=>{throw err})
										   })
										   .catch(err=>{throw err})
																
							})
							.catch( err => {throw err})
					})
					.catch( err => {
						console.log(err);
						res.send("error");
					})
			}
			else {
				forumTools.updatePost(post._id,"[deleted]", "[deleted]")
					 .then( () => {
					 	console.log("Deleted post " + post._id);
						res.send("success");
					 })
					 .catch( err => {
					 	console.log(err);
						res.send("error");
					 })
			}
		})
		.catch( err => {
			console.log(err);
			res.send("404");
		})
})

// Only an admin can edit a post.
// Used with AJAX.

router.post("/post/update/:id", authTools.isLoggedIn, (req, res)=>{
	forumTools.updatePost(req.params.id, req.body.author, req.body.message)
		.then(()=>{
			res.send("success");
		})
		.catch((err)=>{
			console.log(err);
			res.send("error");
		})
})

// Only an admin can delete a thread.
// Used with AJAX.

router.post("/thread/delete/:id", authTools.isLoggedIn, (req, res)=>{
	Thread.findById(req.params.id)
		  .then(thread => {
		  	thread.remove()
		  		.then(()=>{
		  			console.log("Deleted thread " + req.params.id);
		  			res.send("success");
		  		})
		  		.catch((err)=>{
		  			console.log(err)
		  			res.send("error");
		  		})
		  })
		  .catch((err)=>{
		  	console.log(err);
		  	res.send("404");
		  })
})

// Mark an admin-created thread/post. This highlights the author field with
// a special CSS class. It could be done automatically, but doing it manually
// allows me to mark 'admins' that don't have an account. 
// For example, the prof (Ted) is marked as an admin.

// Here we see a problem with my lack of naming conventions. 
// "thread" is being used interchangeably with "post"


// This mark shows up in the main page (list of threads). 
// The author column entry gets highlighted.

router.post("/thread/mark/:id", authTools.isLoggedIn, (req, res)=>{
	Thread.findById(req.params.id)
		  .then(thread => {
		  	if (thread.marked == undefined || !thread.marked)
		  		thread.marked = true;
		  	else thread.marked = false;
		  		thread.save()
		  		.then(()=>{
		  			console.log("Modified mark at thread " + req.params.id)
		  			res.send("success");
		  		})
		  		.catch((err)=>{
		  			console.log(err)
		  			res.send("error");
		  		})
		  })
		  .catch((err)=>{
		  	console.log(err);
		  	res.send("404");
		  })
})

// This mark shows up on a thread-view page, for individual replies/posts.

router.post("/post/mark/:id", authTools.isLoggedIn, (req, res)=>{
	Post.findById(req.params.id)
		  .then(post => {
		  	if (post.marked == undefined || !post.marked)
		  		post.marked = true;
		  	else post.marked = false;
		  		post.save()
		  		.then(()=>{
		  			console.log("Modified mark at post " + req.params.id)
		  			res.send("success");
		  		})
		  		.catch((err)=>{
		  			console.log(err)
		  			res.send("error");
		  		})
		  })
		  .catch((err)=>{
		  	console.log(err);
		  	res.send("404");
		  })
})

// Home page for an arbitrary topic. For example, 'detdb'.

router.get('/:topic', function(req,res) {
	let topic = (req.params.topic).toLowerCase();
	if(topics.has(topic)) {
		Thread.find({topic: topic})
			  .sort('-date')
			  .exec((err, foundThreads) => {
			  	if(err) {
			  		console.log(err);
			  		res.redirect('/404');
			  	}
			  	let threads = foundThreads.reverse();
			  	if (req.isAuthenticated() && req.user.admin)
					res.render(topic, {topic: topic, 
									   threads: threads, 
									   user: req.user.username, 
									   admin: true});
				else res.render(topic, {topic: topic, 
										threads: threads, 
										user: "", 
										admin: false});
			  });
	} else {
		// Topic does not exist in the forum
		res.redirect('/404');
	}
	
});

module.exports = router;