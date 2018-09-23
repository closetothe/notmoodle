
var toolbarOptions = ['bold', 'italic', 'underline', 'strike', 'code-block', {'list': 'ordered'}, {'list': 'bullet'}, {'color':[]}, {'align': []}, 'link', 'image', 'clean'];

var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
  		toolbar: toolbarOptions
	}
});

var getHTML = function() {
	return document.querySelector(".ql-editor").innerHTML;
}