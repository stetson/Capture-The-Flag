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
var game_data = {};

/**
 * These are the models that will handle all of our
 * database access
 * 
 * @namespace models
 */
var models = require("./models.js");

//TODO - purge old users
//TODO - purge old games

/**
 * Update the user's location, or fetch 
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
			game_data[game_id].last_update = new Date();
			game_data[game_id].players[request.body.user_id] = request.body;
			game_data[game_id].players[request.body.user_id]['last_update'] = new Date(),
			
			// Let the user know the operation was successful
			response.send("OK");
		} catch (e) { 
		    response.send({"error": "Could not save state"}, 404);
		}
	} else {
   	// Send the players back to the client
	    game_id = request.query.game_id;
    	if (game_id && game_data[game_id]) {
    		response.send(game_data[game_id]);
    	} else {
    		response.send({"error": "Invalid game (" + game_id + ")"}, 404);
    	}
	}
};

/**
 * Game resource, which lists all games and allows users
 * to create a new game
 * 
 * @memberOf views
 * @name game
 */
exports.get_games = function(request, response) {
    // TODO - limit to a geographic area around the user (using request.body.latitude and request.body.longitude)
	response.send(Object.keys(game_data));
};

/**
 * Create a new game, and return the id
 */
exports.create_game = function(request, response) {
    // Generate a new game id
    game_id = request.body.game_id;
    
    // Create the skeleton of the game
    game_data[game_id] = {
        //origin: {
        //    'latitude': request.body.latitude,
        //    'longitude': request.body.longitude
        //},
        players: {
            'request.body.user_id': {}
        }
    };
    
    response.send(game_id);
};

/**
 * View details about a single game, or join a game
 * 
 * @memberOf views
 * @name game
 */
exports.game_detail = function(request, response) {
	
};