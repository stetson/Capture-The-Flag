/**
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

logic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();

global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

var TWENTY_FEET = 0.000001;
var HALF_FIELD = 0.25;

// Test data
var user_id = "Bob the tester";
var game_id = "test_game";
var user = {
    latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

exports.test_bounds = function(test) {
    // Create game
	controller.create_game(game_id, user.latitude, user.longitude);
    var game = ctf.game_data[game_id];

    // Join game
	test.ok(controller.join_game(game_id, user_id, user), "Could not join game");

    // Start in territory
	ctf.game_data[game_id].players[user_id].latitude += .001;
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user_id].latitude, ctf.game_data[game_id].players[user_id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "The user is not starting the test in their territory");

    // Run logic
    logic.run(ctf.game_data[game_id]);

    // has_flag is false
	test.strictEqual(false, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");

    // blue_flag_captured is false
	test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");

    // observer_mode is false
	test.strictEqual(false, ctf.game_data[game_id].players[user_id].observer_mode, "User is out of bounds, and therefore should be in observer mode");

    // Move over other team's flag
	user.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user_id, user), "Could not move player over flag");

    // Run logic
    logic.run(ctf.game_data[game_id]);
    
    // has_flag is true
	test.strictEqual(true, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");
	
    // blue_flag_captured is true
	test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");
	
    // observer_mode is false
	test.strictEqual(false, ctf.game_data[game_id].players[user_id].observer_mode, "User is out of bounds, and therefore should be in observer mode");

    // move out of bounds
	user.latitude = 31.503629; // China :-)
    user.longitude = 121.289063;
    test.strictEqual(null, controller.update_location(game_id, user_id, user), "Could not move out of bounds");

    // Run logic
    logic.run(ctf.game_data[game_id]);
    
    // observer_mode is true
	test.strictEqual(true, ctf.game_data[game_id].players[user_id].observer_mode, "User is out of bounds, and therefore should be in observer mode");

    // has_flag is false
	test.strictEqual(true, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");

    // blue_flag_captured is false
	test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");
	
	test.done();
};
