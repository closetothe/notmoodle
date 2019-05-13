/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * Global utilities. Right now, only the click data handler.
 */

$(".click").on("click", function(){
    var doc = $(this).html();
    sendClick(doc);
})


function sendClick(doc){
    $.ajax({
      cache: false,
      contentType:"application/x-www-form-urlencoded; charset=utf-8",
      type: "POST",
      url: "/click",
      dataType:'json',
      data: {
        what: doc,
        os: navigator.platform
      }
    })
}
