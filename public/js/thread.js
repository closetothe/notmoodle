var url = window.location.pathname;

$(".permalink").on("click", function(){
	var pm = $(this).parent().attr('id');
	window.location.replace(url + "#" + pm);
})


function pageLoad(){

}


function showError(){
	$("#error").attr("hidden", false);
	console.log("Incomplete fields");
}