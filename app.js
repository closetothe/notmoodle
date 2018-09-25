'use strict';

// Dependencies

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

var Post = require("./models/Post"),
	Thread = require("./models/Thread"),
	User = require("./models/User");
	
var LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose");
	
app.use(require("express-session")({
	secret: process.env.s,
	resave: false,
	saveUninitialized: false
}));

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


app.get('/', function(req,res) {
	res.redirect('/mech215');
})

app.get('/mech215', function(req, res) {
	Thread.find({}).sort('-date').exec((err, foundThreads)=>{
		if (err) {
			console.log(err);
			res.redirect("/404");
		}
		var threads = foundThreads.reverse();
		// console.log(threads);
		if (req.isAuthenticated() && req.user.admin)
			res.render("index", {threads: threads, user: req.user.username, admin: true});
		else res.render("index", {threads: threads, user: "", admin: false});
	});
});



app.get('/mech215/create', function(req,res) {
	res.render("create");
})



app.post('/mech215/create', function(req, res) {
	var resp = {};
	if (!req.body.title || !req.body.author || !req.body.content)
		{	
			res.send('error');
		}
	if (!req.isAuthenticated() && !sanitizeAdmin(req.body.author)){
		res.send('error')
	}

	if (req.isAuthenticated() && !req.user.admin && !sanitizeAdmin(req.body.author)){
		res.send('error')
	}

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

			var newThread = {
				title: req.body.title,
				responses: 0,
				timestamp: post.timestamp,
				author: post.author,
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
				  			res.send(resp);
				  		})
				  		.catch(err => {
				  			throw err
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
		})

	
});


app.get('/post/:id', function(req, res) {
	var id = req.params.id;
	Thread.findById(id, function(err, thread){
		if (err || thread == null) {
			console.log(err);
			res.redirect("/404");
		}
		else {
			getPostPriority(thread.initializer[0], [])
				.then((priority)=>{
					if(req.isAuthenticated())
						res.render("thread", {title:thread.title, priority: priority, user: req.user.username, admin: req.user.admin});
					else
						res.render("thread", {title:thread.title, priority: priority, user: "", admin: false});
				})
				.catch( err => {
					console.log(err);
					res.redirect("/");
				})
		}
	})
});

app.post('/reply', function(req, res) {
	if (!req.body.thread || !req.body.parent || !req.body.author || !req.body.content)
		res.send("auth");
	if (!req.isAuthenticated() && !sanitizeAdmin(req.body.author)){
		res.send('auth');
	}
	if (req.isAuthenticated() && !req.user.admin && !sanitizeAdmin(req.body.author)){
		res.send('auth');
	}
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
								  	try {res.send(resp)
								  	}
								  	catch (err) {
								  		throw err;
								  	}
								  	updateResponses(newPost.thread);
								  	sendMail(parentPost);
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
	


});

app.post("/post/delete/:id", isLoggedIn, (req, res)=>{
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
				updatePost(post._id,"[deleted]", "[deleted]")
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

app.post("/post/update/:id", isLoggedIn, (req, res)=>{
	updatePost(req.params.id, req.body.author, req.body.message)
		.then(()=>{
			res.send("success");
		})
		.catch((err)=>{
			console.log(err);
			res.send("error");
		})
})

app.post("/thread/delete/:id", isLoggedIn, (req, res)=>{
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

app.post("/thread/mark/:id", isLoggedIn, (req, res)=>{
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

app.post("/post/mark/:id", isLoggedIn, (req, res)=>{
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


app.get("/login", isNotLoggedIn, (req, res)=>{
	res.render("login");
})

app.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    }), (req, res)=>{
  
})

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// app.get("/signup", isNotLoggedIn, (req, res)=>{
// 	res.render("signup");
// })

// app.post("/signup", isNotLoggedIn, (req, res) => {
    
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

app.get('*', function(req, res) {
	res.render("404");
});


app.listen(3000, function() {
	console.log("Starting server...");
});


function updateResponses(id){
	Thread.findById(id, (err, thread) => {
		if (err) console.log(err);
		else {
			thread.responses++;
			thread.save()
				  .then( ()=> {console.log("Incremented thread " + id)} )
				  .catch(err => {console.log(err)} );
		}
	})
}


var getPostPriority = async function(nodeRef, array){
	try {
		var node = await Post.findById(nodeRef)
	}
	catch (err) {
		return Promise.reject(err)
	}
	array.push(node);
		// console.log(children);
	var len = node.children.length;
	for(var i = 0; i < len; i++){
		await getPostPriority(node.children[i], array);
	}
	return array;	
}

var updatePost = async function (id, author, message){
	Post.findById(id)
		.then( post => {
			post.author = author;
			post.body = message;
			post.save()
				.then(()=>{
					console.log("Updated post " + post._id);
					//console.log(post);
					return true;
				})
				.catch( (err) => {
					throw err;
				})
		})
		.catch( err => {
			console.log("Failed to update post " + id, err)
			return Promise.reject(err);
		})
}


function isNotLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        res.redirect("/");    
    } 
    else {
        next();
    }
}

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        next();  
    } 
    else {
        res.redirect("/login");
    }
}

function sanitizeAdmin(string){
	var str = string.toLowerCase();
	if (str == "admin" || str == "jamiel" || str == "jamiel rahi" || str =="ta") return false;
	var strs = str.match(/\S+/g);
	for (var i in strs){
		if (strs[i]=="admin" || strs[i]=="jamiel" || strs[i]=="rahi" || strs[i]=="ta") return false
	}
	return true;
}

function sendMail(arg){
	// do shit
}

