/* global location, _, $, console, log, paramString, urlDefines, urlParams */


var fsIE6 = function(paramString) {
  window.open("task.html?" + paramString, "fullscreen", "fullscreen,height="+screen.height+",width="+screen.width+"directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=no,resizable=no");
};


$(document).ready(function() {
  if (typeof urlParams["pid"] == "undefined") {
    $("#manual-id").keyup(function() {
      if ($(this).val().length > 0) {
        $("#enter-id button").removeAttr("disabled");
      } else {
        $("#enter-id button").attr("disabled","disabled");
      }
    });

    $("#enter-id button").one("click", function() {
      var id = $("#manual-id").val();

      var newUrlDefines = paramString + "&pid=" + id;
      log(newUrlDefines);
      fsIE6(newUrlDefines);
      
      
    });
    $("#enter-id").show();



  } else {
    $("#launch button").one("click", function() {
      fsIE6(paramString);
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
  $("#enter-id, #launcher").hide();
  $("#done").show();
};
