$("#forum").on("click",".list-delete-btn",function(){
    var threadId = $(this).parent().attr("id");
    showDeleteTrueForm(threadId);
})

$("#forum").on("click",".list-cancel-btn",function(){
    var threadId = $(this).parent().attr("id");
    cancelDelete(threadId);
})

var deleteTrueForm = false;

function showDeleteTrueForm(parent){
	$("#"+parent+" > .list-delete-btn").attr("hidden", true);
	$("#"+parent+" > .list-positive-btn").attr("hidden", false);
	$("#"+parent+" > .list-cancel-btn").attr("hidden", false);
	deleteTrueForm = true;
}

function cancelDelete(parent){
	$("#"+parent+" > .list-delete-btn").attr("hidden", false);
	$("#"+parent+" > .list-positive-btn").attr("hidden", true);
	$("#"+parent+" > .list-cancel-btn").attr("hidden", true);
	deleteTrueForm = false;
}

$("#forum").on("click",".list-positive-btn",function(){
    var threadId = $(this).parent().attr("id");
    $.post("/thread/delete/"+threadId, {}, function(resp){
        if (resp == "success") location.reload();
        else window.location.replace("/error");
    })
})

$("#forum").on("click",".list-mark-btn",function(){
    var threadId = $(this).parent().attr("id").split('-')[1];
    $.post("/thread/mark/"+threadId, {}, function(resp){
        if (resp == "success") location.reload();
        else window.location.replace("/error");
    })
})

console.log("Tagging posts...");
tagPosts();