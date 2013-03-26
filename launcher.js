/* global location, _, $ */

var paramString = (location.href.indexOf("?") == -1) ? "" :
      _(location.href.split("?")).last(),
    urlDefines = paramString
      .split("&")
      .map(function(x) { return x.split("=")}),
    urlParams = _(urlDefines).object();

var fsIE6 = function(paramString) {
  window.open("task.html?" + paramString, "fullscreen", "fullscreen,directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=no,resizable=no");
};


$(document).ready(function() {
  if (typeof urlParams["participant_id"] == "undefined") {
    $("#manual-id").keyup(function() {
      if ($(this).val().length > 0) {
        $("#enter-id button").removeAttr("disabled");
      } else {
        $("#enter-id button").attr("disabled","disabled");
      }
    });

    $("#enter-id button").one("click", function() {
      var id = $("#manual-id").val();

      var newUrlDefines = paramString + "&participant_id=" + id;
      console.log(newUrlDefines);
      fsIE6(newUrlDefines);
      
      
    });
    $("#enter-id").show();



  } else {
    $("#launch button").one("click", function() {
      fsIE6(urlDefines);
    });
    $("#launch").show();
  }
});


var fsChrome = function() {
  var $iframe = $("#iframe")[0];
  $iframe.webkitRequestFullScreen();
  $iframe.src = "ospan.html";
};



var done = function() {
  $("#done").text("DONE");
};
