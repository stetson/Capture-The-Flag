/**
 * Filesystem object for file access
 */
var fs = require('fs');

exports.purge_players = function() {
    for (var game_iterator in ctf.game_data) {
        if (ctf.game_data.hasOwnProperty(game_iterator)) {
        for (var player_iterator in ctf.game_data[game_iterator].players) {
            if (ctf.game_data[game_iterator].players.hasOwnProperty(player_iterator)) {
                // Calculate time since last update
                var time_since_last_update;
                try {
                    time_since_last_update = new Date() - new Date(ctf.game_data[game_iterator].players[player_iterator].last_update);
                } catch (e) {
                    time_since_last_update = 0;
                }
                
                // Purge players who haven't updated in over 1 minute
                if (time_since_last_update >= ctf.constants.DISABLE_USER_INTERVAL * ctf.constants.MINUTE) {
                    ctf.game_data[game_iterator].players[player_iterator].latitude = 0;
                    ctf.game_data[game_iterator].players[player_iterator].longitude = 0;
                    ctf.game_data[game_iterator].players[player_iterator].accuracy = 0;
                    console.log("Deactivating user:" + player_iterator);
                }
                
                // Reclaim memory of players who haven't updated in 5 minutes
                if (time_since_last_update >= ctf.constants.PURGE_USER_INTERVAL * ctf.constants.MINUTE ||
                        ctf.game_data[game_iterator].players[player_iterator].last_update === undefined) {
                    delete ctf.game_data[game_iterator].players[player_iterator];
                    console.log("Purging user:" + player_iterator);
                }
            }
        }
        }
    }
};

exports.purge_games = function() {
    for (var game_iterator in ctf.game_data) {
        if (ctf.game_data.hasOwnProperty(game_iterator)) {
            // Calculate time since last update
            var time_since_last_update = new Date() - new Date(ctf.game_data[game_iterator].last_update);
            
            // Delete games that haven't been played on in a while
            if (time_since_last_update >= ctf.constants.PURGE_GAMES_INTERVAL * ctf.constants.MINUTE) {
                delete ctf.game_data[game_iterator];
                console.log("Purging game:" + game_iterator);
            }
        }
    }
};

exports.backup_game_data = function() {
    fs.writeFile('game_data.dat', JSON.stringify(ctf.game_data));
};