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
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
ctf.algorithms = new algorithms_class.Algorithms();
 
// Periodically backup data
setInterval(function() {
    fs.writeFile('game_data.dat', JSON.stringify(ctf.game_data));
}, 10 * ctf.constants.SECOND);

// Purge old users
setInterval(function() {
    for (var game_iterator in ctf.game_data) {
        if (ctf.game_data.hasOwnProperty(game_iterator)) {
        for (var player_iterator in ctf.game_data[game_iterator].players) {
            if (ctf.game_data[game_iterator].players.hasOwnProperty(player_iterator)) {
                // Calculate time since last update
                var time_since_last_update = new Date() - ctf.game_data[game_iterator].players[player_iterator].last_update;
                
                // Purge players who haven't updated in over 1 minute
                if (time_since_last_update >= ctf.constants.DISABLE_USER_INTERVAL * ctf.constants.MINUTE) {
                    ctf.game_data[game_iterator].players[player_iterator].latitude = 0;
                    ctf.game_data[game_iterator].players[player_iterator].longitude = 0;
                    ctf.game_data[game_iterator].players[player_iterator].accuracy = 0;
                }
                
                // Reclaim memory of players who haven't updated in 5 minutes
                if (time_since_last_update >= ctf.constants.PURGE_USER_INTERVAL * ctf.constants.MINUTE) {
                    delete ctf.game_data[game_iterator].players[player_iterator];
                }
            }
        }
        }
    }
}, ctf.constants.DISABLE_USER_INTERVAL * ctf.constants.MINUTE);

// Purge old games
setInterval(function() {
    for (var game_iterator in ctf.game_data) {
        if (ctf.game_data.hasOwnProperty(game_iterator)) {
            // Calculate time since last update
            var time_since_last_update = new Date() - ctf.game_data[game_iterator].last_update;
            
            // Delete games that haven't been played on in over 20 minutes
            if (time_since_last_update >= ctf.constants.PURGE_GAMES_INTERVAL * ctf.constants.MINUTE) {
                delete ctf.game_data[game_iterator];
            }
        }
    }
}, ctf.constants.PURGE_GAMES_INTERVAL * ctf.constants.MINUTE);

/**
 * Update the user's location
 * 
 * @memberOf views
 * @name update_location
 */
exports.update_location = function(request, response) {
    // Record user's location
	try {
		var game_id = request.body.game_id;
		var user_id = request.body.user_id;
		
		if (user_id && ctf.game_data[game_id].players[user_id] !== undefined) {
            ctf.game_data[game_id].last_update = new Date();
            ctf.game_data[game_id].players[user_id] = request.body;
            ctf.game_data[game_id].players[user_id].last_update = new Date();

            //Let the user know the operation was successful
            response.send({"response": "OK"});
            return;
		}
	} catch (e) { } 
	
	response.send({"error": "Invalid user"}, 404);
};

/**
 * Get the locations of the other players
 * 
 * @memberOf views
 * @name get_location 
 */
exports.get_location = function(request, response) {
    // Send the players back to the client
    var game_id = request.query.game_id;
    
    if (game_id && ctf.game_data[game_id]) {
        response.send(ctf.game_data[game_id].players);
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
exports.get_games = function(request, response) {
	var user_latitude = request.query.latitude;
	var user_longitude = request.query.longitude;
	
	var games_in_radius = [];

	for (var game_iterator in ctf.game_data) {
        if (ctf.game_data.hasOwnProperty(game_iterator)) 
		{
        	var distance = ctf.algorithms.distance_in_miles(
        			ctf.game_data[game_iterator].origin.latitude, 
        			ctf.game_data[game_iterator].origin.longitude, 
        			user_latitude, 
        			user_longitude);
			if (distance < ctf.constants.GAME_RADIUS || ! user_latitude || ! user_longitude)
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
    ctf.game_data[game_id] = {
        origin: {
            'latitude': request.body.latitude,
            'longitude': request.body.longitude
        },
        last_update: new Date(),
        players: {}
    };
    
    // Send confirmation back to client
    response.send({"response": "OK"});
};

/**
 * Join a game
 * 
 * @memberOf views
 * @name game
 * @param game_id
 */
exports.join_game = function(request, response) {
    if (! request.body.user_id) {
        response.send({"error": "Invalid user"}, 404);
    } else if (! ctf.game_data[request.params.game_id]) {
        response.send({"error": "Invalid game"}, 404);
    } else {
        ctf.game_data[request.params.game_id].players[request.body.user_id] = request.body;
        response.send({"response": "OK"});
    }
};
