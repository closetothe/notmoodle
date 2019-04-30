
var toolbarOptions = ['bold', 'italic', 'underline', 'strike', {'color':[]}, 'code-block', 'formula', {'list': 'ordered'}, {'list': 'bullet'}, {'align': []}, 'link', 'image', 'clean'];
var quill;

function quillInit(){
	quill = new Quill('#editor', {
	  theme: 'snow',
	  modules: {
	  		toolbar: toolbarOptions
		}
	});
}

var getHTML = function() {
	return document.querySelector(".ql-editor").innerHTML;
}