var algorithms_class = require("../modules/build/default/Algorithms.node");
/**
 * The collection of algorithms used by the application
 *
 * @namespace logic
 */
var algorithms = new algorithms_class.Algorithms();

/**
 * Constant that determines the side length of the field in miles
 */
var GAME_SIZE_IN_MI = 0.25;

/**
 * Update the user's location
 * 
 * @memberOf controller
 * @name update_location
 * @param game_id {String} The id of the game
 * @param user_id {String} The id of the user to update
 * @param user {Object} The user to update (sent from client)
 * @returns {String} error message
 * @function
 */
exports.update_location = function(game_id, user_id, user) {
    if (ctf.game_data[game_id] === undefined) {
        return "Invalid game";
    } 
    
    if (ctf.game_data[game_id].players[user_id] === undefined) {
        return "Invalid user";
    }
    
    ctf.game_data[game_id].last_update = new Date();
    for (var property in user) {
        ctf.game_data[game_id].players[user_id][property] = user[property];
    }
    ctf.game_data[game_id].players[user_id].last_update = new Date();
    return null;
};


/**
 * Send a message from one user to another
 * 
 * @memberOf controller
 * @name send_message
 * @param game_id {String} The id of the game
 * @param user_id {String} The id of the user receiving the message
 * @param user_id {String} The id of the user sending the message
 * @param message {Object} The message payload
 * @returns {String} Failure message, or null if successful
 * @function
 */
exports.send_message = function(game_id, to_id, from_id, message) {
    if (ctf.game_data[game_id] === undefined) {
        return "Game was not found";
    }
    
    // Grab player objects
    var to = ctf.game_data[game_id].players[to_id];
    var from = ctf.game_data[game_id].players[from_id];
    
    // Make sure both players are in the game and the message is valid
    if (to === undefined) {
        return "Recipient was not found";
    } else if (from === undefined) {
        return "Sender was not found";
    } else if (! message) {
        return "Message was blank";
    }
    
    // Only people on the same team to send messages
    if (to.team != from.team) {
        return "Players must be on the same team";
    }
    
    // Add the message to the queue
    ctf.game_data[game_id].players[to_id].messages.push({
        from: from_id,
        message: message
    });
    
    return null;
};


/**
 * Update flag's location
 * 
 * @memberOf controller
 * @name move_flag
 * @param game_id {String} The id of the game
 * @param user_id {String} The id of the user to update
 * @param user {Object} The user to update (sent from client)
 * @returns {String} error message
 * @function
 */

exports.move_flag = function(game_id, user_id, team, latitude, longitude) {
    if (ctf.game_data[game_id] === undefined) {
        return "Invalid game";
    }
    
	// Only allow creator to make changes
    if (ctf.game_data[game_id].creator != user_id) {
		return "Permission denied";
	}
    
    // Only valid team choices allowed
    if (team != "red" && team != "blue") {
        return "Invalid team";
    }
    
    // Ensure latitude is valid
    if (isNaN(latitude) || latitude > 180 || latitude < -180) {
        return "Invalid latitude";
    }
    
    // Ensure longitude is valid
    if (isNaN(longitude) || longitude > 180 || longitude < -180) {
        return "Invalid longitude";
    }
    
    // Ensure that the flag is placed in the correct territory
    var territory = team + "_bounds";
    if (! algorithms.in_rectangle(
            latitude, longitude,
            ctf.game_data[game_id][territory].top_left.latitude,
            ctf.game_data[game_id][territory].top_left.longitude,
            ctf.game_data[game_id][territory].bottom_right.latitude,
            ctf.game_data[game_id][territory].bottom_right.longitude
            )) {
        return "Not in the correct territory";
    }
	
	// Change flag location
	flag = team + "_flag";
	ctf.game_data[game_id][flag].latitude = latitude;
	ctf.game_data[game_id][flag].longitude = longitude;

    return null;
};


/**
 * Get the locations of the other players
 * 
 * @memberOf controller
 * @name get_location 
 * @param game_id
 * @returns {Array} players or false
 * @function
 */
exports.get_location = function(game_id) {
    if (game_id && ctf.game_data[game_id]) {
        return ctf.game_data[game_id].players;
    } else {
        return false;
    }
};

/**
 * Game resource, which lists all games and allows users
 * to create a new game
 * 
 * @memberOf controller
 * @name get_games
 * @param user_latitude The latitude where the user is currently
 * @param user_longitude The longitude where the user is currently
 * @return {Array} Games that are in range
 * @function
 */ 
exports.get_games = function(user_latitude, user_longitude) {
    var games_in_radius = [];

    for (var game_iterator in ctf.game_data) {
        if (ctf.game_data.hasOwnProperty(game_iterator)) 
        {
            var distance = algorithms.distance_in_miles(
                    ctf.game_data[game_iterator].origin.latitude, 
                    ctf.game_data[game_iterator].origin.longitude, 
                    user_latitude, 
                    user_longitude);
            if (distance < ctf.constants.GAME_RADIUS)
            {
                games_in_radius.push({
                    name: game_iterator,
                    distance: distance,
                    players: Object.keys(ctf.game_data[game_iterator].players).length
                });
            }
        }
    }
    
    return games_in_radius;
};

/**
 * Create a new game, and return the id
 * <pre>
 * |~~~~~~~~~~~~~~|
 * |              |
 * |______________|
 * |          \   |
 * |  r=sqrt(fs)\ | height = field_size
 * |_____________\|
 *    2 * field_size
 * </pre>
 * 
 * @memberOf controller
 * @name create_game
 * @param game_id {String} The requested game_id
 * @param latitude {Number} The latitude of the game to be created
 * @param longitude {Number} The longitude of the game to be created
 * @returns {Boolean} if successful
 * @function
 */
exports.create_game = function(game_id, user_id, latitude, longitude, field_size) {
    if (ctf.game_data[game_id] === undefined && latitude && longitude) {
        // Dynamically set field size
        if (! field_size) {
            field_size = GAME_SIZE_IN_MI;
        }
        
        // Create game
        ctf.game_data[game_id] = {
            origin: {
                'latitude': latitude,
                'longitude': longitude
            },
            red_flag: algorithms.add_miles_to_coordinate(latitude, longitude, 0.9 * field_size, 0),
            blue_flag: algorithms.add_miles_to_coordinate(latitude, longitude, 0.9 * field_size, 180),
            red_flag_captured: false,
            blue_flag_captured: false,
            red_bounds: {
                top_left: algorithms.add_miles_to_coordinate(latitude, longitude, Math.sqrt(2 * Math.pow(field_size, 2)), 315),
                bottom_right: algorithms.add_miles_to_coordinate(latitude, longitude, field_size, 90)
            },
            blue_bounds: {
                top_left: algorithms.add_miles_to_coordinate(latitude, longitude, field_size, 270),
                bottom_right: algorithms.add_miles_to_coordinate(latitude, longitude, Math.sqrt(2 * Math.pow(field_size, 2)), 135)
            },
            last_update: new Date(),
            players: {},
            red: 0,
            blue: 0,
            red_score: 0,
            blue_score: 0,
            creator: user_id,
            field_size: field_size
        };
        
        // Fix the precision of the bounds so in_rectangle can accurately judge in bounds
        ctf.game_data[game_id].red_bounds.top_left.latitude = ctf.game_data[game_id].red_bounds.top_left.latitude.toFixed(6);
        ctf.game_data[game_id].red_bounds.top_left.longitude = ctf.game_data[game_id].red_bounds.top_left.longitude.toFixed(6);
        ctf.game_data[game_id].red_bounds.bottom_right.latitude = ctf.game_data[game_id].red_bounds.bottom_right.latitude.toFixed(6);
        ctf.game_data[game_id].red_bounds.bottom_right.longitude = ctf.game_data[game_id].red_bounds.bottom_right.longitude.toFixed(6);
        ctf.game_data[game_id].blue_bounds.top_left.latitude = ctf.game_data[game_id].blue_bounds.top_left.latitude.toFixed(6);
        ctf.game_data[game_id].blue_bounds.top_left.longitude = ctf.game_data[game_id].red_bounds.top_left.longitude;
        ctf.game_data[game_id].blue_bounds.bottom_right.latitude = ctf.game_data[game_id].blue_bounds.bottom_right.latitude.toFixed(6);
        ctf.game_data[game_id].blue_bounds.bottom_right.longitude = ctf.game_data[game_id].red_bounds.bottom_right.longitude;       
        return true;
    } else {
        return false;
    }
};

/**
 * Join a game
 * 
 * @memberOf controller
 * @name join_game
 * @param game_id {String} The id of the game to join
 * @param user_id {String} The id of the user to join
 * @param user {Object} The user to join (sent from client)
 * @returns {Boolean} if successful
 * @function
 */
exports.join_game = function(game_id, user_id, user) {
    if (! user_id || ! game_id || ! ctf.game_data[game_id]) {
        return false;
    } else {
        ctf.game_data[game_id].players[user_id] = {};
        for (var property in user) {
            ctf.game_data[game_id].players[user_id][property] = user[property];
        }
        
        ctf.game_data[game_id].players[user_id].team = ctf.game_data[game_id].red > ctf.game_data[game_id].blue ? 'blue' : 'red';
        ctf.game_data[game_id].players[user_id].has_flag = false;
		ctf.game_data[game_id].players[user_id].captures = 0;
		ctf.game_data[game_id].players[user_id].tags = 0;
        ctf.game_data[game_id].players[user_id].observer_mode = true;
        ctf.game_data[game_id].players[user_id].messages = [];
        ctf.game_data[game_id][ctf.game_data[game_id].players[user_id].team] += 1;
        return true;
    }
};

/**
 * Leave a game
 * 
 * @memberOf controller
 * @name leave_game
 * @param game_id {String} The id of the game to join
 * @param user_id {String} The id of the user to join
 * @returns {Boolean} if successful
 * @function
 */
exports.leave_game = function(game_id, user_id) {
    // Validate data
    if (ctf.game_data[game_id] === undefined || 
        ctf.game_data[game_id].players[user_id] === undefined) {
        return false;
    }
    
    // Decrement team count
    ctf.game_data[game_id][ctf.game_data[game_id].players[user_id].team] -= 1;
    if (ctf.game_data[game_id][ctf.game_data[game_id].players[user_id].team] < 0) {
        ctf.game_data[game_id][ctf.game_data[game_id].players[user_id].team] = 0;
    }        
    
    // Delete them from the game
    delete ctf.game_data[game_id].players[user_id];
    
    return true;
};