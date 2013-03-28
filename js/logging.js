/* global location, _, $, console */

var log = (function(x) {
  var logs = []; 
  return function(message, properties) {
    // three function signatures:
    // 1. log() - just return logs
    // 2. log(message) - log a message
    // 3. log(message, properties) - log a message with properties
    
    if (typeof message == "undefined") {
      return logs.slice();
    }
    
    try {
      console.log(message);
    } catch(e) {
    } 

    logs.push(_.extend({message: message}, properties)); 

    return message;
  }; 
})();

var paramString = (location.href.indexOf("?") == -1) ? "" :
      _(location.href.split("?")).last(),
    urlDefines = paramString
      .split("&")
      .map(function(x) { return x.split("=")}),
    urlParams = _(urlDefines).object();
