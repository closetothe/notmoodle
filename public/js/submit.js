var titleBox = $("#title-box");
var nameBox = $("#name-box");
var emailBox = $("#email-box");
var defaultText = "Enter text here! Use the </> feature for code snippets.\n"

$("#submit").on("click", function(){
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
			email: email
		}

		$.post( "/mech215/create", postData, function( id ) {
		  console.log(id, "redirecting...");
		  $("#submit").attr("disabled", true);
		  window.location.replace("/post/" + id);
		});

	}
	else {
		showError();
	}
})

function showError(){
	$("#error").attr("hidden", false);
	console.log("Incomplete fields");
}