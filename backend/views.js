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
var run_logic = function() {
    for (game in ctf.game_data){
        if (ctf.game_data.hasOwnProperty(game)) {
            logic.run(ctf.game_data[game]);
        }
    }
    
    setTimeout(run_logic, 100);
};
run_logic();

/**
 * The log of location updates
 */
var log = fs.createWriteStream("update_location.csv", { flags: "a" });

exports.update_location = function(request, response) {
    // Record user's location
    if (request.body !== undefined && request.body.game_id !== undefined && request.body.user_id !== undefined) {
    	var game_id = request.body.game_id;
    	var user_id = request.body.user_id;
    	var user = request.body;
    } else {
        response.send({"error": "Some required information was missing"}, 400);
        return;
    }
    
    // Validate incoming data
    if (request.body.latitude === undefined || isNaN(request.body.latitude) 
    		|| request.body.longitude === undefined || isNaN(request.body.longitude)) {
    	response.send({"error": "Invalid data"}, 400);
        return;
    }
    	
	var update = controller.update_location(game_id, user_id, user);
    if (update === null) {
        // Log the update
	    try {
            log.write('"' + user.name + '","' + user.latitude.replace(/\s+$/, "") + '","' + user.longitude.replace(/\s+$/, "") + '","' + user.accuracy.replace(/\s+$/, "") + '","' + new Date() + '"\n');
	    } catch (e) {
	        log.end();
	        log = fs.createWriteStream("update_location.csv", { flags: "a" });
	    }
	    
	    // Send the locations of the other players back
	    var locations = controller.get_location(game_id);
	    
	    if (locations) {
	        response.send(ctf.game_data[game_id]);
	    } else {
	        response.send({"error": "Invalid game"}, 400);
	    }
	    
        return;
	}
	
	response.send({"error": update}, 400);
};

exports.send_message = function(request, response) {
    // Validate information
    if (request.body.game_id !== undefined && request.body.to_id !== undefined && request.body.from_id !== undefined && request.body.message !== undefined) {
        var game_id = request.body.game_id;
        var to_id = request.body.to_id;
        var from_id = request.body.from_id;
        var message = request.body.message;
        
        // Send the message
        var error = controller.send_message(game_id, to_id, from_id, message);
        if (! error) {
            response.send({"response": "OK"}, 200);
        } else {
            // Message sending failed
            response.send({"error": error}, 400);
        }
        
    } else {
        response.send({"error": "Some required information was missing"}, 400);
    }
};
 
exports.move_flag = function(request, response) {
    // Record flag's location
    if (request.body.team !== undefined && request.body.game_id !== undefined && request.body.user_id !== undefined && request.body.latitude !== undefined && request.body.longitude !== undefined) {
    	var game_id = request.body.game_id;
    	var user_id = request.body.user_id;
		var team = request.body.team;
    	var latitude = request.body.latitude;
		var longitude = request.body.longitude;
		
		if (ctf.game_data[game_id] === undefined) {
		    response.send({"error": "Game was not found"}, 404);
		    return;
		}
		
		var status = controller.move_flag(game_id, user_id, team, latitude, longitude);
		if (status === null) {
		    response.send({"response": "OK"}, 200);
		} else {
		    response.send({"error": status}, 400);
		}		
    } else {
        response.send({"error": "Some required information was missing"}, 400);
    }
};

exports.get_games = function(request, response) {
    if (request.query.latitude !== undefined && request.query.longitude !== undefined) {
    	var user_latitude = request.query.latitude;
    	var user_longitude = request.query.longitude;
    } else {
        response.send({"error": "Some required information was missing"}, 400);
        return;
    }
	
    games_in_radius = controller.get_games(user_latitude, user_longitude);
	response.send({
		games: games_in_radius
	});
};

exports.create_game = function(request, response) {
    // Generate a new game id
    var game_id = "";
    
    if (request.body.user_id === undefined) {
        response.send({"error": "Some required information was missing"}, 400);
        return;
    } else {
        var user_id = request.body.user_id;
    }
    
    if (request.body !== undefined && request.body.game_id !== undefined) {
        game_id = request.body.game_id;
    } else if (request.body !== undefined && request.body.name !== undefined) {
        game_id = request.body.name;         
    } else {
        response.send({"error": "Some required information was missing"}, 400);
        return;
    }
    
    // Make sure we have latitude and longitude as well
    if (request.body.latitude !== undefined && request.body.longitude !== undefined) {
        var latitude = request.body.latitude;
        var longitude = request.body.longitude;
    } else {
        response.send({"error": "Some required information was missing"}, 400);
        return;
    }
    
    // Create the skeleton of the game
    if (controller.create_game(game_id, user_id, latitude, longitude)) {
        response.send({"response": "OK"});
    } else {
        response.send({"error": "Game already exists"}, 409);
    }
};

exports.join_game = function(request, response) {
    if (request.body.user_id !== undefined && request.params.game_id !== undefined) {
        var user_id = request.body.user_id;
        var game_id = request.params.game_id;
        var user = request.body;
    } else {
        response.send({"error": "Some required information was missing"}, 400);
        return;
    }
    
    if (controller.join_game(game_id, user_id, user)) {
        response.send(ctf.game_data[game_id]);
    } else {
        response.send({"error": "Could not join game"}, 404);
    }
};

exports.leave_game = function(request, response) {
    // Ensure game was provided and exists
    if (request.params.game_id !== undefined && 
        ctf.game_data[request.params.game_id] !== undefined) {
        var game_id = request.params.game_id;
    } else {
        response.send({"error": "Game was not found"}, 404);
        return;
    }
    
    // Ensure that player exists
    if (request.params.user_id === undefined) {
        response.send({"error": "Some required information was missing"}, 400);
        return;
    } 
    
    // Ensure that the player is in the game
    var user_id = request.params.user_id.replace(/\s+$/, "");
    if (ctf.game_data[game_id].players[user_id] === undefined) {
        response.send({"error": "User was not found"}, 410);
        return;
    }
    
    // Attempt to remove the player from the game
    if (controller.leave_game(game_id, user_id)) {
        response.send({"response": "OK"});
        return;
    } else {
        // Something is jacked up
        response.send({"error": "Could not remove player from game"}, 500);
    }    
};