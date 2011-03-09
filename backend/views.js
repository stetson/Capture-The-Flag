/**
 * Views.js
 * 
 * These are the views that will return the JSON necessary for gameplay
 * 
 * @author Mark Cahill
 */

/**
 * Filesystem object for file access
 */
var fs = require('fs');

/**
 * Constants for use in the program
 */
var constants = {
	MINUTE: 60*1000,
	SECOND: 1000,
	DISABLE_USER_INTERVAL: 1, // Disable users which have not reported their location in this period of time (in minutes)
	PURGE_USER_INTERVAL: 5, // Purge users which have not reported their location in this period of time (in minutes)
	PURGE_GAMES_INTERVAL: 20, // Purge games which have not been updated in this period of time (in minutes)
	GAME_RADIUS: 5 // Fetch games within this many miles of the user 
};

/**
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();
 
// Periodically backup data
setInterval(function() {
    fs.writeFile('game_data.dat', JSON.stringify(game_data));
}, 10 * constants.SECOND);

// Purge old users
setInterval(function() {
    for (var game_iterator in game_data) {
        if (game_data.hasOwnProperty(game_iterator)) {
        for (var player_iterator in game_data[game_iterator].players) {
            if (game_data[game_iterator].players.hasOwnProperty(player_iterator)) {
                // Purge players who haven't updated in over 1 minute
                if (new Date() - game_data[game_iterator].players[player_iterator].last_update >= constants.DISABLE_USER_INTERVAL * constants.MINUTE) {
                    game_data[game_iterator].players[player_iterator].latitude = 0;
                    game_data[game_iterator].players[player_iterator].longitude = 0;
                    game_data[game_iterator].players[player_iterator].accuracy = 0;
                }
                
                // Reclaim memory of players who haven't updated in 5 minutes
                if (new Date() - game_data[game_iterator].players[player_iterator].last_update >= constants.PURGE_USER_INTERVAL * constants.MINUTE) {
                    delete game_data[game_iterator].players[player_iterator];
                }
            }
        }
        }
    }
}, constants.DISABLE_USER_INTERVAL * constants.MINUTE);

// Purge old games
setInterval(function() {
    for (var game_iterator in game_data) {
            if (game_data.hasOwnProperty(game_iterator)) {
            // Delete games that haven't been played on in over 20 minutes
            if (new Date() - game_data[game_iterator].last_update >= constants.PURGE_GAMES_INTERVAL * constants.MINUTE) {
                delete game_data[game_iterator];
            }
        }
    }
}, constants.PURGE_GAMES_INTERVAL * constants.MINUTE);

/**
 * Update the user's location
 * 
 * @memberOf views
 * @name update_location
 */
exports.update_location = function(request, response) {
    // Record user's location
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

/**
 * Get the locations of the other players
 * 
 * @memberOf views
 * @name get_location 
 */
exports.get_location = function(request, response) {
    // Send the players back to the client
    game_id = request.query.game_id;
    if (game_id && game_data[game_id]) {
        response.send(game_data[game_id].players);
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
	var user_latitude = request.query.latitude;
	var user_longitude = request.query.longitude;
	
	var games_in_radius = [];

	for (var game_iterator in game_data) {
        if (game_data.hasOwnProperty(game_iterator)) 
		{
        	var distance = algorithms.distance_in_miles(
        			game_data[game_iterator].origin.latitude, 
        			game_data[game_iterator].origin.longitude, 
        			user_latitude, 
        			user_longitude);
			if (distance < constants.GAME_RADIUS || ! user_latitude || ! user_longitude)
			{
				games_in_radius.push( game_iterator );
			}
		}
	}
	response.send( games_in_radius );
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
 * Join a game
 * 
 * @memberOf views
 * @name game
 * @param game_id
 */
exports.join_game = function(request, response) {
	
};
