function tagPosts(){
    // Find all posts prefixed with a [TAG] and highlight the tags
    var titles = $(".thread-link");
    var re = /\[.*\]/;
    if($("#thread-title").length > 0) titles = $("#thread-title");
    
    for(var i = 0; i < titles.length; i++) {
        var match = titles[i].innerHTML.match(re)
        if(match) {
            var taggedHTML = '<span class="tag">' + match + '</span>';
            var split = titles[i].innerHTML.split(re);
            taggedHTML = split[0] + taggedHTML + split[1];
            titles[i].innerHTML = taggedHTML;
            
        }
    }
}