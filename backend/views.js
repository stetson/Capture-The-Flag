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
 * Constants for use in the program
 */
var constants = {
	MINUTE: 60*1000,
	SECOND: 1000
};

/**
 * Import filesystem object for file access
 */
var fs = require('fs');

/**
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();
 
/**
 * Global variables for distance
 */
const miles_of_distance = 5;
 
// Periodically backup data
setInterval(function() {
    fs.writeFile('game_data.dat', JSON.stringify(game_data));
}, 10 * constants.SECOND);

// Load data on startup (after 500ms)
setTimeout(function() {
    // Load game_data.dat 	
	fs.readFile('game_data.dat', function(err, data) {
		game_data = JSON.parse(data);    
	});
}, .5 * constants.SECOND);

// Purge old users
setInterval(function() {
    for (var game_iterator in game_data) {
        if (game_data.hasOwnProperty(game_iterator)) {
        for (var player_iterator in game_data[game_iterator].players) {
            if (game_data[game_iterator].players.hasOwnProperty(player_iterator)) {
                // Purge players who haven't updated in over 1 minute
                if (new Date() - game_data[game_iterator].players[player_iterator].last_update >= one_minute) {
                    game_data[game_iterator].players[player_iterator].latitude = 0;
                    game_data[game_iterator].players[player_iterator].longitude = 0;
                    game_data[game_iterator].players[player_iterator].accuracy = 0;
                }
                
                // Reclaim memory of players who haven't updated in 5 minutes
                if (new Date() - game_data[game_iterator].players[player_iterator].last_update >= five_minutes) {
                    delete game_data[game_iterator].players[player_iterator];
                }
            }
        }
        }
    }
}, constants.MINUTE);

// Purge old games
setInterval(function() {
    for (var game_iterator in game_data) {
            if (game_data.hasOwnProperty(game_iterator)) {
            // Delete games that haven't been played on in over 20 minutes
            if (new Date() - game_data[game_iterator].last_update >= twenty_minutes) {
                delete game_data[game_iterator];
            }
        }
    }
}, 20 * constants.MINUTE);

/**
 * Update the user's location
 * 
 * @memberOf views
 * @name update_location
 */
exports.update_location = function(request, response) {
    // Log incoming information for debugging purposes
    console.log(request.body);
    
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
	user_latitude = request.body.latitude;
	user_longitude = request.body.longitude;

	for (var game_iterator in game_data) {
        if (game_data.hasOwnProperty(game_iterator)) 
		{
			if (algorithms.distance(game_data[game_iterator].latitude, game_data[game_iterator].longitude, user_latitude, user_longitude) < miles_of_distance )
			{
				response.write(get_games);
			}
		}
	}
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
	// Return game detail
};
