/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * This function highlights tags on a post. For example,
 * "[TASK] Create D3 scatterplots"
 * The '[TASK]' portion is highlighted.
 * The function simply searches the page for anything that matches a tag, and
 * applies a CSS class to it. It works on both the index and an individual
 * thread page.
 */

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