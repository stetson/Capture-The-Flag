/**
 * Views.js
 * 
 * These are the views that will return the JSON necessary for gameplay
 * 
 * @author Mark Cahill
 */

/**
 * These are the models that will handle all of our
 * database access
 * 
 * @namespace models
 */
var models = require("./models.js");

/**
 * Update the user's location, and fetch the locations of
 * the other players
 * 
 * @memberOf views
 * @name update_location
 * @param id {Number} The user's id
 * @param latitude {Number}	The user's current latitude
 * @param longitude {Number} The user's current longitude
 * @param accuracy {Number} The accuracy of the location in meters
 */
exports.update_location = function(request, response) {	
	// Record user's location
	try {
		//players[request.body.user_id] = {
		//	'latitude': request.body.latitude,
		//	'longitude': request.body.longitude,
		//	'accuracy': request.body.accuracy,
		//	'last_update': new Date(),
		//	'auth_token': request.body.auth_token
		//};
	} catch (e) { }
	
	// Send the players back to the client
	console.log(request.connection.remoteAddress + ' updated their location');
	response.send(players);
};