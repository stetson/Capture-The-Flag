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
	// Fixture for other players locations
	players = {
		1: { 'latitude': 47.5432, 'longitude': 83.34567, 'accuracy': 5 },
		2: { 'latitude': 47.4753, 'longitude': 83.3478, 'accuracy': 5 },
		3: { 'latitude': 47.4578, 'longitude': 83.8568, 'accuracy': 5 }
	};
	
	// Send the JSON back to the client
	console.log(request.connection.remoteAddress + ' updated their location');
	response.send(players);
};