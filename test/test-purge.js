global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

// Set up fixtures
var user_id = "Bob the tester";
var game_id = "test_game";
var user = {
    latitude: 29.034681,
    longitude: -81.303774     
};

// Populate data
controller.create_game(game_id, user.latitude, user.longitude);
controller.join_game(game_id, user_id, user);
controller.update_location(game_id, user_id, user);

ctf.constants = {
    MINUTE: 60,
    SECOND: 1,
    DISABLE_USER_INTERVAL: 1, // Disable users which have not reported their location in this period of time (in minutes)
    PURGE_USER_INTERVAL: 5, // Purge users which have not reported their location in this period of time (in minutes)
    PURGE_GAMES_INTERVAL: 20, // Purge games which have not been updated in this period of time (in minutes)
    GAME_RADIUS: 5 // Fetch games within this many miles of the user 
};

var utils = require("../backend/utils.js");

exports.test_purge_players = function(test) {
    test.strictEqual(undefined, ctf.game_data[game_id].players["The Tooth Fairy"]);
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user_id]);
    setTimeout(function() {
        utils.purge_players();
        test.equal(0, ctf.game_data[game_id].players[user_id].latitude);
        setTimeout(function() {
            utils.purge_players();
            test.strictEqual(undefined, ctf.game_data[game_id].players[user_id]);
            test.done();
        }, ctf.constants.PURGE_USER_INTERVAL * ctf.constants.MINUTE);
    }, ctf.constants.DISABLE_USER_INTERVAL * ctf.constants.MINUTE);
};

exports.test_purge_games = function(test) {
    setTimeout(function() {
        utils.purge_games();
        test.strictEqual(undefined, ctf.game_data[game_id]);
        test.done();
    }, ctf.constants.PURGE_GAMES_INTERVAL * ctf.constants.MINUTE);
};