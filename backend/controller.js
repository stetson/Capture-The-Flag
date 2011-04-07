algorithms_class = require("../modules/build/default/Algorithms.node");
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
            if (distance < ctf.constants.GAME_RADIUS || ! user_latitude || ! user_longitude)
            {
                games_in_radius.push( game_iterator );
            }
        }
    }
    
    return games_in_radius;
};

/**
 * Create a new game, and return the id
 * 
 * @memberOf controller
 * @name create_game
 * @param game_id {String} The requested game_id
 * @param latitude {Number} The latitude of the game to be created
 * @param longitude {Number} The longitude of the game to be created
 * @returns {Boolean} if successful
 * @function
 */
exports.create_game = function(game_id, latitude, longitude) {
    if (ctf.game_data[game_id] === undefined && latitude && longitude) {
        ctf.game_data[game_id] = {
            origin: {
                'latitude': latitude,
                'longitude': longitude
            },
            red_flag: algorithms.add_miles_to_coordinate(latitude, longitude, 0.9 * GAME_SIZE_IN_MI, 0),
            blue_flag: algorithms.add_miles_to_coordinate(latitude, longitude, 0.9 * GAME_SIZE_IN_MI, 180),
            red_flag_captured: false,
            blue_flag_captured: false,
            red_bounds: {
                top_left: algorithms.add_miles_to_coordinate(latitude, longitude, Math.sqrt(2 * Math.pow(GAME_SIZE_IN_MI, 2)), 315),
                bottom_right: algorithms.add_miles_to_coordinate(latitude, longitude, GAME_SIZE_IN_MI, 90)
            },
            blue_bounds: {
                top_left: algorithms.add_miles_to_coordinate(latitude, longitude, GAME_SIZE_IN_MI, 270),
                bottom_right: algorithms.add_miles_to_coordinate(latitude, longitude, Math.sqrt(2 * Math.pow(GAME_SIZE_IN_MI, 2)), 135)
            },
            last_update: new Date(),
            players: {},
            red: 0,
            blue: 0,
            red_score: 0,
            blue_score: 0
        };
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
        ctf.game_data[game_id][ctf.game_data[game_id].players[user_id].team] += 1;
        return true;
    }
};