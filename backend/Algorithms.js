/**
 * Algorithms.js
 * 
 * Trying to follow the google tutorial on javascript api and adjust it to limiting a game's lat and long.
 * 
 * @author Laura Seletos
 */


/**
* Function that limits the map's latitude and longitude based on the user's gps corrdinates 
*/
function distance(user_latitude, user_longitude) {
  
  /** 
  * Creating new geo location limited to the user's lat and long
  */
  var playersLatLong = new google.maps.LatLng(user_latitude, user_longitude);

  var myOptions = {
    zoom: 8,
    center: playersLatLong,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}
  
function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=initialize";
  document.body.appendChild(script);
}
  
window.onload = loadScript;

