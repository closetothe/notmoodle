var url = window.location.pathname;
var threadId = $("#metadata").attr("thread-id");
var replyOpen = false;
var defaultText = "Enter text here! Use the </> feature for code snippets.\n"


$("#thread-container").on("click", ".permalink", function(){
	var pm = $(this).parent().attr('id');
	window.location.replace(url + "#" + pm);
})

$("#thread-container").on("click", ".parent", function(){
	var parent = $(this).parent().attr("parent");
	window.location.replace(url + "#" + parent);
})

$("#thread-container").on("click", ".reply", function(){
	var location = $(this).parent().attr('id');
	openReply(location, "reply");
})

$("#thread-container").on("click", ".edit", function(){
	var location = $(this).parent().attr('id');
	if (deleteTrueForm) cancelDelete(location);
	openReply(location, "edit");
})

$("#thread-container").on("click", "#discard", function(){
	var location = $(this).parent().parent().attr('id').split('-')[1];
	closeReply(location);
})

$("#thread-container").on("click", ".delete", function(){
	var parentId = $(this).parent().attr('id');
	showDeleteTrueForm(parentId);
})

$("#thread-container").on("click", ".cancel", function(){
	var parentId = $(this).parent().attr('id');
	cancelDelete(parentId);
})

$("#thread-container").on("click", ".you-sure", function(){
	var postId = $(this).parent().attr('id');
	console.log(postId);
	$.post("/post/delete/"+postId, {}, function(resp){
		
		if (resp == "success"){
			window.location.replace("/post/"+threadId);
			location.reload();
		}
		else {
			ajaxError(resp);
			window.location.replace("/error");
		}
		
	})
})

$("#thread-container").on("click", "#submit", function(){
	$("#submit").attr("disabled",true);
	var nameBox = $("#name-box");
	var emailBox = $("#email-box");
	var parent = $(this).parent().parent().attr('id').split('-')[1];
	if (nameBox.val() && quill.getText() != defaultText && quill.getText() != "\n"){

		var email = "";

		if (emailBox.val()){
			email = emailBox.val();
		}

		var postData = {
			thread: threadId,
			parent: parent,
			author: nameBox.val(),
			content: getHTML(),
			email: email
		}

		$.post("/reply", postData, function(resp){
			if (resp.status === "success"){
				window.location.replace("/post/"+threadId+"#"+resp.id);
				location.reload();
			}
			else if (resp == "auth"){
				showError();
			}
			else {
				var info = "";
				$("#submit").attr("disabled",false);
				if(resp.details) info = resp.details;
				ajaxError(info);
				// window.location.replace("/error");
			}
		})


		
	}
	else{
		$("#submit").attr("disabled",false);
		showError();
	}
})

$("#thread-container").on("click", "#submit-edit", function(){
	$("#submit").attr("disabled",true);
	var nameBox = $("#name-box");
	var postId = $(this).parent().parent().attr('id').split('-')[1];
	
	if (nameBox.val() && quill.getText() != "\n"){
	console.log("???")
		var postData = {
			post: postId,
			author: nameBox.val(),
			message: getHTML(),
		}

		$.post("/post/update/"+postId, postData, function(resp){
			if (resp === "success"){
				window.location.replace("/post/"+threadId+"#"+resp.id);
				location.reload();
			}
			else {
				var info = "";
				$("#submit").attr("disabled",false);
				if(resp.details) info = resp.details;
				ajaxError(info);
				// window.location.replace("/error");
			}
		})


		
	}
	else{
		showError();
		$("#submit").attr("disabled",false);
	}
})

function pageLoad(){

}



// <div class = "reply-box">
// 		<h1 class="reply-h1">Reply</h1>
// 		<p id="error" class="more-red" hidden><em>You must enter all the fields!</em></p>
// 		<form action="/post" method="POST">
// 		    <div class="form-row">
// 			    <div class="col">
// 			      <input type="text" id="name-box" name="author" class="form-control" placeholder="Your Name">
// 			    </div>
// 			    <div class="col">
// 			      <input type="email" id = "email-box" name = "content" class="form-control" placeholder="(Optional) Email notification">
// 			    </div>
// 		    </div>
// 	  	</form>
		
// 		<div id="quill-container" class="bg-white">
// 			<div id="toolbar" class="border-top"></div>
// 			<div id="editor" class="border-bottom">
// 			<p>Enter text here! <em>Use the &lt;/&gt; feature for code snippets.</em></p>
// 			</div>
// 		</div>
// 		<button id="submit" class="btn btn-dark">Submit</button>
//		<button id="discard" class="btn btn-outline-dark">Discard</button>
// </div>

var replyHTML = '<div class = "reply-box"><h1 class="reply-h1">Reply</h1><p id="error" class="more-red" hidden><em>You must enter all the fields!</em></p><form action="/post" method="POST"><div class="form-row"><div class="col"><input type="text" id="name-box" name="author" class="form-control" placeholder="Your Name"></div><div class="col"><input type="email" id = "email-box" name = "content" class="form-control" placeholder="(Optional) Email notification" disabled></div></div></form><div id="quill-container" class="bg-white"><div id="toolbar" class="border-top"></div><div id="editor" class="border-bottom"><p>Enter text here! <em>Use the &lt;/&gt; feature for code snippets.</em></p></div></div><button id="submit" class="btn btn-dark">Submit</button><button id="discard" class="btn btn-outline-dark">Discard</button></div>'
var editHTML = '<div class = "edit-box"><h1 class="reply-h1">Edit</h1><p id="error" class="more-red" hidden><em>You must enter all the fields!</em></p><form action="/post" method="POST"><div class="form-row"><div class="col"><input type="text" id="name-box" name="author" class="form-control" placeholder="Your Name"></div><div class="col"><input type="email" id = "email-box" name = "content" class="form-control" placeholder="(Optional) Email notification" disabled></div></div></form><div id="quill-container" class="bg-white"><div id="toolbar" class="border-top"></div><div id="editor" class="border-bottom"><p>Enter text here! <em>Use the &lt;/&gt; feature for code snippets.</em></p></div></div><button id="submit-edit" class="btn btn-dark">Submit</button><button id="discard" class="btn btn-outline-dark">Discard</button></div>'


function openReply(location, type) {
	if (!replyOpen){
		
		$(".reply").attr("disabled", true);
		$(".edit").attr("disabled", true);
		if(type == "reply") $("#reply-" + location).html(replyHTML);
		else if (type =="edit") {
			var author = 
			$("#reply-" + location).html(editHTML);
			$("#editor").html(getMessage(location));
			$("#name-box").val(getAuthor(location));
		}
		quillInit();
		replyOpen = true;
	}
}


function closeReply(location) {
	if (replyOpen){
		$(".reply").attr("disabled", false);
		$(".edit").attr("disabled", false);
		$("#reply-" + location).html("");
		replyOpen = false;
	}
}

function getAuthor(id){
	return $("#"+id+" > .post-details > p > .post-author").html()
}

function getMessage(id){
	return $("#"+id+" > .post-body").html()
}

var deleteTrueForm = false;

function showDeleteTrueForm(parent){
	$("#"+parent+" > .delete").attr("hidden", true);
	$("#"+parent+" > .you-sure").attr("hidden", false);
	$("#"+parent+" > .cancel").attr("hidden", false);
	deleteTrueForm = true;
}

function cancelDelete(parent){
	$("#"+parent+" > .delete").attr("hidden", false);
	$("#"+parent+" > .you-sure").attr("hidden", true);
	$("#"+parent+" > .cancel").attr("hidden", true);
	deleteTrueForm = false;
}

function showError(){
	$("#error").attr("hidden", false);
	console.log("Incomplete fields");
}

function ajaxError(info){
	$("#ajax-error").attr("hidden", false);
	console.log("AJAX error", info);
}
