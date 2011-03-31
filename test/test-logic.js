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

// Test users    
    var user1 = {
        id: "Bob the Tester",
        latitude: 29.034681,    // 29°02′04.9″N
        longitude: -81.303774   // 81°18′13.6″W
    };
    
    var user2 = {
        id: "Laura the Amazing",
        latitude: 29.034681,    // 29°02′04.9″N
        longitude: -81.303774   // 81°18′13.6″W
    };

exports.test_win_flags = function(test) {
    // Create game and position players
    var game_id = "test-win-flags";
    test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    test.ok(controller.join_game(game_id, user2.id, user2), "user2 could not join game");
    user1.latitude += TWENTY_FEET;
    user2.latitude -= TWENTY_FEET;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user1.id].latitude, ctf.game_data[game_id].players[user1.id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "The user is not starting the test in their territory");
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user2.id].latitude, ctf.game_data[game_id].players[user2.id].longitude,
            ctf.game_data[game_id].blue_bounds.top_left.latitude, ctf.game_data[game_id].blue_bounds.top_left.longitude,  
            ctf.game_data[game_id].blue_bounds.bottom_right.latitude, ctf.game_data[game_id].blue_bounds.bottom_right.longitude), "The user is not starting the test in their territory");
    test.equal("red", ctf.game_data[game_id].players[user1.id].team, "user1 is not on the right team");
    test.equal("blue", ctf.game_data[game_id].players[user2.id].team, "user2 is not on the right team");
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.equal(0, ctf.game_data[game_id].blue_score, "The blue score is not 0");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "user1 has the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].has_flag, "user2 has the flag");
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "Red flag is captured");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "Blue flag is captured");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "user2 is in observer mode");
    
    // Move player over flag
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that the user has the flag and that it is captured
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 is on the flag, and is still in observer mode");
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].has_flag, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    
    // Move player back into territory
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that the user has the flag and that it is not captured
    test.equal(1, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "The user doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    
    // Clean up
    delete ctf.game_data[game_id];
    
    test.done();
};

exports.test_bounds_tagging = function(test) {
    // Create game and position players
    var game_id = "test-bounds-tagging";
    test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "Could not join game");
    test.ok(controller.join_game(game_id, user2.id, user2), "Could not join game");
    user1.latitude += TWENTY_FEET;
    user2.latitude -= TWENTY_FEET;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    
    // Test preconditions
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user1.id].latitude, ctf.game_data[game_id].players[user1.id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "The user is not starting the test in their territory");
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user2.id].latitude, ctf.game_data[game_id].players[user2.id].longitude,
            ctf.game_data[game_id].blue_bounds.top_left.latitude, ctf.game_data[game_id].blue_bounds.top_left.longitude,  
            ctf.game_data[game_id].blue_bounds.bottom_right.latitude, ctf.game_data[game_id].blue_bounds.bottom_right.longitude), "The user is not starting the test in their territory");
    test.equal("red", ctf.game_data[game_id].players[user1.id].team, "user1 is not on the right team");
    test.equal("blue", ctf.game_data[game_id].players[user2.id].team, "user2 is not on the right team");
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.equal(0, ctf.game_data[game_id].blue_score, "The blue score is not 0");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "user1 has the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].has_flag, "user2 has the flag");
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "Red flag is captured");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "Blue flag is captured");
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 not starting in observer mode");
    test.strictEqual(true, ctf.game_data[game_id].players[user2.id].observer_mode, "user2 not starting in observer mode");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Players shouldn't be in observer mode anymore
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "user2 in observer mode");
    
    // Mode user1 to user2
    user1.latitude = user2.latitude;
    user1.longitude = user2.longitude;
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    
    // Run logic
    logic.run(ctf.game_data[game_id]);
    
    // Test in observer_mode
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "The user doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 in observer mode");
    
    // Move back to starting points
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    user2.latitude = ctf.game_data[game_id].origin.latitude - TWENTY_FEET;
    user2.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    
    // Run logic
    logic.run(ctf.game_data[game_id]);
    
    // Test not in observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 in observer mode");
    
    // Move out of bounds
    user1.latitude = ctf.game_data[game_id].red_bounds.top_left.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].red_bounds.top_left.longitude + TWENTY_FEET;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not move user1 out of bounds");
    
    // Run logic
    logic.run(ctf.game_data[game_id]);
    
    // Test in observer mode
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "The user doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 in observer mode");
    
    // Move back to starting points
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    user2.latitude = ctf.game_data[game_id].origin.latitude - TWENTY_FEET;
    user2.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    
    // Run logic
    logic.run(ctf.game_data[game_id]);
    
    // Test not in observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 in observer mode");
    
    // Move player over flag
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that the user has the flag and that it is captured
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].has_flag, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 in observer mode");
    
    // Move user2 over user 1
    user2.latitude = user1.latitude;
    user2.longitude = user1.longitude;
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    
    // Run logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that user1 is in observer mode and does not have flag
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 not in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "user1 in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "The user should't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user should't have the flag");
    
    // Move player back into territory
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that the user has the flag and that it is not captured
    test.equal(0, ctf.game_data[game_id].red_score, "The red score is not 0");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "The user doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 in observer mode");
    
    // Clean up
    delete ctf.game_data[game_id];
    
    test.done();
};