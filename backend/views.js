/**
 * Views.js
 * 
 * These are the views that will return the JSON necessary for gameplay
 * 
 * @author Mark Cahill
 */

/**
 * Global memory store for game data
 */
var game_data = {
	'only_game': {
		'players': []
	}
};

/**
 * These are the models that will handle all of our
 * database access
 * 
 * @namespace models
 */
var models = require("./models.js");

/**
 * Optionally update the user's location, and fetch 
 * the locations of the other players
 * 
 * @memberOf views
 * @name location 
 * @param id {Number} The user's id
 * @param latitude {Number}	The user's current latitude
 * @param longitude {Number} The user's current longitude
 * @param accuracy {Number} The accuracy of the location in meters
 */
exports.location = function(request, response, method) {	
	if (method === "POST") {
		// Record user's location
		try {
			game_id = request.body.game_id;
			game_data[game_id].players[request.body.user_id] = {
				'latitude': request.body.latitude,
				'longitude': request.body.longitude,
				'accuracy': request.body.accuracy,
				'last_update': new Date(),
				'auth_token': request.body.auth_token
			};
		} catch (e) { }
	}
	
	// Send the players back to the client
	if (game_id && game_data[game_id]) {
		response.send(game_data[game_id]);
	} else {
		response.send({"error": "Invalid game"}, 404);
	}	
};

/**
 * Game resource, which lists all games and allows users
 * to create a new game
 * 
 * @memberOf views
 * @name game
 */
exports.game = function(request, response) {
	
};

/**
 * View details about a single game, or join a game
 * 
 * @memberOf views
 * @name game
 */
exports.game_detail = function(request, response) {
	
};