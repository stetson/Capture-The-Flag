/**
 * Update the user's location
 * 
 * @memberOf controller
 * @name update_location
 */
exports.update_location = function(game_id, user_id) {
    if (user_id && ctf.game_data[game_id] && ctf.game_data[game_id].players[user_id] !== undefined) {
        ctf.game_data[game_id].last_update = new Date();
        ctf.game_data[game_id].players[user_id] = request.body;
        ctf.game_data[game_id].players[user_id].last_update = new Date();
        return true;
    }
    
    return false;
};

/**
 * Get the locations of the other players
 * 
 * @memberOf controller
 * @name get_location 
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
 */ 
exports.get_games = function(user_latitude, user_longitude) {
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
    
    return games_in_radius;
};

/**
 * Create a new game, and return the id
 * 
 * @memberOf controller
 * @name create_game
 * @param game_id
 */
exports.create_game = function(game_id) {
    if (ctf.game_data[game_id] === undefined) {
        ctf.game_data[game_id] = {
            origin: {
                'latitude': request.body.latitude,
                'longitude': request.body.longitude
            },
            last_update: new Date(),
            players: {}
        };
    } else {
        return false;
    }
};

/**
 * Join a game
 * 
 * @memberOf controller
 * @name join_game
 * @param game_id
 */
exports.join_game = function(game_id, user_id, user) {
    if (! user_id || ! game_id || ! ctf.game_data[game_id]) {
        return false;
    } else {
        ctf.game_data[game_id].players[user_id] = user;
        return true;
    }
};