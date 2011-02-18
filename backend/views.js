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

//Global memory caches

/**
 * Stores all active players
 */
var players;
players = {};
//setInterval(persist_players, 60000);

/**
 * Purge old players
 * 
 * @memberOf players
 * @name purge_players
 */
purge_players = function() {
	for (var player_iterator in players) {
		// Purge players who haven't updated in over 15 seconds
		if (new Date() - players[player_iterator].last_update > 15000) {
			players[player_iterator].latitude = 0;
			players[player_iterator].longitude = 0;
			players[player_iterator].accuracy = 0;
		}
		
		// Reclaim memory of players who haven't updated in 5 minutes
		if (new Date() - players[player_iterator].last_update > 300000) {
			delete players[player_iterator];
		}
	}
};

setInterval(purge_players, 5000);

/**
 * Stores all active games
 */
var games = {};
//setInterval(persist_games, 60000);

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
		players[request.body.user_id] = {
			'latitude': request.body.latitude,
			'longitude': request.body.longitude,
			'accuracy': request.body.accuracy,
			'last_update': new Date(),
			'auth_token': request.body.auth_token
		};
	} catch (e) { }
	
	// Send the players back to the client
	console.log(request.connection.remoteAddress + ' updated their location');
	response.send(players);
};