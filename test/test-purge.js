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
controller.create_game(game_id, user.id, user.latitude, user.longitude);
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
    // Make sure that non-existent users aren't in Array
    test.strictEqual(undefined, ctf.game_data[game_id].players["The Tooth Fairy"]);
    
    // Make sure the user we expect to be in there is
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user_id]);
    
    // Make sure our team count is what we expect it to be
    test.equal(1, ctf.game_data[game_id].red);
    test.equal(0, ctf.game_data[game_id].blue);
    
    setTimeout(function() {
        // Set deactivation
        utils.purge_players();
        
        // Make sure the player has been deactivated
        test.equal(0, ctf.game_data[game_id].players[user_id].latitude);
        
        setTimeout(function() {
            // Set purge
            utils.purge_players();
            
            // Make sure the player is gone
            test.strictEqual(undefined, ctf.game_data[game_id].players[user_id]);
            
            // Make sure our team count is what we expect it to be
            test.equal(0, ctf.game_data[game_id].red);
            test.equal(0, ctf.game_data[game_id].blue);
            
            // Add a fake player
            ctf.game_data[game_id].players[user_id] = { last_update: new Date("1983-06-27") };
            
            // Set purge
            utils.purge_players();
            
            // Make sure our team count is what we expect it to be
            test.equal(0, ctf.game_data[game_id].red);
            test.equal(0, ctf.game_data[game_id].blue);
            
            test.done();
        }, ctf.constants.PURGE_USER_INTERVAL * ctf.constants.MINUTE + 5);
    }, ctf.constants.DISABLE_USER_INTERVAL * ctf.constants.MINUTE + 5);
};

exports.test_purge_games = function(test) {
    setTimeout(function() {
        // Make sure the game exists
        test.notStrictEqual(undefined, ctf.game_data[game_id]);
        
        // Purge it
        utils.purge_games();
        
        // Make sure the game does not exist
        test.strictEqual(undefined, ctf.game_data[game_id]);
        test.done();
    }, ctf.constants.PURGE_GAMES_INTERVAL * ctf.constants.MINUTE);
};