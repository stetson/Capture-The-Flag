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
exports.update_location = function(request, response) {
	// Record user's location
	console.log(request.body);
	try {
		game_id = request.body.game_id;
		user_id = request.body.user_id;
		
		if (user_id) {
            game_data[game_id].last_update = new Date();
            game_data[game_id].players[user_id] = request.body;
            game_data[game_id].players[user_id].last_update = new Date();

            //Let the user know the operation was successful
            response.send("OK");
            return;
		}
	} catch (e) { } 
	
	response.send({"error": "Could not save state"}, 404);
};

exports.get_location = function(request, response) {
    // Send the players back to the client
    game_id = request.query.game_id;
    if (game_id && game_data[game_id]) {
        response.send(game_data[game_id].players);
        //console.log(game_data[game_id]);
    } else {
        response.send({"error": "Invalid game (" + game_id + ")"}, 404);
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
    game_id = request.body.name;
    
    // Create the skeleton of the game
    game_data[game_id] = {
        origin: {
            'latitude': request.body.latitude,
            'longitude': request.body.longitude
        },
        last_update: new Date(),
        players: {}
    };
    
    // Send confirmation back to client
    response.send("OK");
};

/**
 * View details about a single game, or join a game
 * 
 * @memberOf views
 * @name game
 */
exports.game_detail = function(request, response) {
	
};