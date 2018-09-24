'use strict';

// Dependencies

var express = require("express"),
	compression = require("compression"),
	bodyParser = require("body-parser"),
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
	Thread = require("./models/Thread");

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
		var threads = foundThreads;
		// console.log(threads);
		res.render("index", {threads: threads});
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

	var newPost = {};
	newPost.thread = [];
	newPost.children = [];
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
					res.render("thread", {title:thread.title, priority: priority});
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
		res.send("error");
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
								  	res.send(resp)
								  	updateResponses(newPost.thread);
								  	sendMail(parentPost);
						  		})
						  		.catch( err => {throw err});
						  })
						  .catch( err => {throw err})
			})
		})
		.catch( err => {
			console.log(err);
			resp.status="err";
			resp.details = err;
			res.send(resp)
		})
	


});

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

	var node = await Post.findById(nodeRef)
	array.push(node);
		// console.log(children);
	var len = node.children.length;
	for(var i = 0; i < len; i++){
		await getPostPriority(node.children[i], array);
	}
	return array;	
}



function sendMail(post){
	// send that shit
}

