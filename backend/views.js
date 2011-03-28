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

var fs = require('fs');

logic_class = require("../modules/build/default/Logic.node");
/**
 * The state engine which handles all business logic for the application
 *
 * @namespace logic
 */
var logic = new logic_class.Logic();

/**
 * The log of location updates
 */
var log = fs.createWriteStream("update_location.csv", { flags: "a" });

exports.update_location = function(request, response) {
    // Record user's location
	var game_id = request.body.game_id;
	var user_id = request.body.user_id;
	var user = request.body;
	
	if (controller.update_location(game_id, user_id, user)) {
        // Log the update
	    try {
	       log.write('"' + user.name + '","' + user.latitude + '","' + user.longitude + '","' + user.accuracy + '","' + new Date() + '"\n');
	    } catch (e) {
	        log.end();
	        log = fs.createWriteStream("update_location.csv", { flags: "a" });
	    }
	    
	    // Send the locations of the other players back
	    var locations = controller.get_location(game_id);
	    
	    if (locations) {
	        response.send(locations);
	    } else {
	        response.send({"error": "Invalid game"}, 404);
	    }
	    
        return;
	}
	
	response.send({"error": "Invalid user"}, 404);
};

exports.get_games = function(request, response) {
	var user_latitude = request.query.latitude;
	var user_longitude = request.query.longitude;
	
    games_in_radius = controller.get_games(user_latitude, user_longitude);
	response.send(games_in_radius);
};

exports.create_game = function(request, response) {
    // Generate a new game id
    var game_id = "";
    if (request.body.game_id) {
        game_id = request.body.game_id;
    } else {
        game_id = request.body.name;         
    }
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    
    // Create the skeleton of the game
    if (controller.create_game(game_id, latitude, longitude)) {
        response.send({"response": "OK"});
    } else {
        response.send({"error": "Game already exists"}, 409);
    }
};

exports.join_game = function(request, response) {
    var user_id = request.body.user_id;
    var game_id = request.params.game_id;
    var user = request.body;
    if (controller.join_game(game_id, user_id, user)) {
        response.send(ctf.game_data[game_id]);
    } else {
        response.send({"error": "Could not join game"}, 404);
    }
};
