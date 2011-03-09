/**
 * Views.js
 * 
 * These are the views that will return the JSON necessary for gameplay
 * 
 * @author Mark Cahill
 */

/**
 * The controller which will coordinate interaction
 * between the views and the model
 * 
 * @namespace controller
 */
var controller = require("../backend/controller.js");

/**
 * Update the user's location
 */
exports.update_location = function(request, response) {
    // Record user's location
	var game_id = request.body.game_id;
	var user_id = request.body.user_id;
	var user = request.body;
	
	if (controller.update_location(game_id, user_id)) {
        //Let the user know the operation was successful
        response.send({"response": "OK"});
        return;
	}
	
	response.send({"error": "Invalid user"}, 404);
};

/**
 * Get the locations of the other players
 */
exports.get_location = function(request, response) {
    // Send the players back to the client
    var game_id = request.query.game_id;
    var locations = controller.get_location(game_id);
    
    if (locations) {
        response.send(locations);
    } else {
        response.send({"error": "Invalid game"}, 404);
    }
};

/**
 * Game resource, which lists all games and allows users
 * to create a new game
 */ 
exports.get_games = function(request, response) {
	var user_latitude = request.query.latitude;
	var user_longitude = request.query.longitude;
	
    games_in_radius = controller.get_games(user_latitude, user_longitude);
	response.send(games_in_radius);
};

/**
 * Create a new game, and return the id
 */
exports.create_game = function(request, response) {
    // Generate a new game id
    var game_id = request.body.name;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    
    // Create the skeleton of the game
    if (controller.create_game(game_id)) {
        response.send({"response": "OK"});
    } else {
        response.send({"error": "Game already exists"}, 409);
    }
};

/**
 * Join a game
 */
exports.join_game = function(request, response) {
    user_id = request.body.user_id;
    game_id = request.params.game_id;
    user = request.body;
    if (controller.join_game(game_id, user_id, user)) {
        response.send({"response": "OK"});
    } else {
        response.send({"error": "Could not join game"}, 404);
    }
};
