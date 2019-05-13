/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * This file handles post creation. Note that we use the global 'topic' variable
 * to tell the server which topic it falls under. This variable is injected into
 * a script tag through EJS. Obviously, this is not the best way.
 */


var titleBox = $("#title-box");
var nameBox = $("#name-box");
var emailBox = $("#email-box");
var defaultText = "Enter text here! Use the </> feature for code snippets.\n"
quillInit();

$("#submit").on("click", function(){
	console.log(topic);
	if (titleBox.val() && nameBox.val() && quill.getText() != defaultText && quill.getText() != "\n"){
		
		var title = titleBox.val();
		var author = nameBox.val();
		var content = getHTML();
		var email = "";	

		if (emailBox.val()){
			email = emailBox.val();
		}

		var postData = {
			title: title,
			author: author,
			content: content,
			email: email,
		}

		// Note: using global variable 'topic'
		// (I know, this is not the best way of doing things...)
		$.post( "/" + topic + "/create", postData, function( resp, err ) {
		  if (resp.status === "success"){
			  console.log(resp.id, "redirecting...");
			  $("#submit").attr("disabled", true);
			  window.location.replace("/post/" + resp.id);
			}
		  else {
		  	var info = "";
		  	if(resp.details) info = resp.details;
		  	showError();
		  }
		})
		.fail(function(e){
			showError(e.statusText + " (" + e.status + ")");
		});

	}
	else {
		showError();
	}
})

function showError(){
	$("#error").html("Incomplete fields!");
	$("#error").attr("hidden", false);
	console.log("Incomplete fields");
	window.scrollTo(0,0)
}

function ajaxError(info){
	$("#error").html("Unexpected error");
	$("#error").attr("hidden", false);
	console.log("AJAX error", info);
	window.scrollTo(0,0)
}

function showError(text){
	$("#error").html(text);
	$("#error").attr("hidden", false);
	console.log("ERROR: \n", text);
	window.scrollTo(0,0)
}
