/**
 * Algorithms.js
 * 
 * Trying to follow the google tutorial on javascript api and adjust it to limiting a game's lat and long.
 * 
 * @author Laura Seletos
 */

/**
* Calculate the distance in miles between two gps coordinates
* 
*  @memberOf algorithms
*  @name distance_in_miles
*  @param c1_latitude {Number} The latitude of the first coordinate
*  @param c1_longitude {Number} The longitude of the first coordinate
*  @param c2_latitude {Number} The latitude of the second coordinate
*  @param c2_longitude {Number} The longitude of the second coordinate
*/
exports.distance_in_miles = function(c1_latitude, c1_longitude, c2_latitude, c2_longitude) {

	var R = 6371; // km
	var dLat = (c2_latitude-c1_latitude).toRad();
	var dLon = (c2_longitude-c1_longitude).toRad(); 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(c1_latitude.toRad()) * Math.cos(c2_latitude.toRad()) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	
    return 0;
};