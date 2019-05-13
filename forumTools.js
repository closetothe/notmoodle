/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * Forum utilities.
 */

'use strict';

var Post = require("./models/Post"),
	Thread = require("./models/Thread");

// Increment the number of posts in a thread
var updateResponses = function (id) {
	Thread.findById(id, (err, thread) => {
		if (err) console.log(err);
		else {
			thread.responses++;
			thread.save()
				  .then( ()=> {console.log("Incremented thread " + id)} )
				  .catch(err => {console.log(err)} );
		}
	})
};

// Flatten thread tree into a list. This list is the order in which to display
// posts top-down on a thread page. The indentation of the posts to the right
// is determined upon creation by the 'depth' property in the Post model.
// This property is essentally just the number of replies before the
// post in question.
// Thus, we only need to compute the top-down order, and the indentation
// is prepared ahead of time.
// I really like this function.
var getPostPriority = async function (nodeRef, array) {
	try {
		var node = await Post.findById(nodeRef)
	} catch (err) {
		return Promise.reject(err)
	}
	array.push(node);
	var len = node.children.length;
	for(var i = 0; i < len; i++){
		await getPostPriority(node.children[i], array);
	}
	return array;	
}

// Used for editing posts
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


// Hardcoded so that people don't post as me. Not elegant, but works enough.
// Someone could read this and know how to get around it, but I'd be notified
// of the post and could delete it anyway. This was really just an excuse
// to use regular expressions in the wild.
var sanitizeAdmin = function (string) {
	var str = string.toLowerCase();
	if (str == "admin" || str == "jamiel" || str == "jamiel rahi" || str =="ta") return false;
	var strs = str.match(/\S+/g);
	for (var i in strs){
		if (strs[i]=="admin" || strs[i]=="jamiel" || strs[i]=="rahi" || strs[i]=="ta") return false
	}
	return true;
}

// Figure out what semester it is at the time of posting.
// ---------
// Fall is defined as September (inclusive) to January (exclusive)
// Winter is defined as Jan (inclusive) to May (exclusive)
// Summer is defined as May (inclusive) to September (exclusive)
var determineSemester = function () {
    // MONTH INDEX
	// Jan -> 0
	// Feb -> 1
	// ...
	// May -> 4
	// ...
	// Sept -> 8
	var today = new Date();
	var month = today.getMonth();
	var semester;
	if (month >= 0 && month < 4) semester = "winter";
	else if (month >= 4 && month < 8) semester = "summer";
	else semester = "fall";
	
	return semester;
}

module.exports.updateResponses = updateResponses;
module.exports.getPostPriority = getPostPriority;
module.exports.updatePost = updatePost;
module.exports.sanitizeAdmin = sanitizeAdmin;
module.exports.determineSemester = determineSemester;
