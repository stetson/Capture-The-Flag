global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");
var TWENTY_FEET = 0.000001;

logic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();

algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

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

var user3 = {
    id: "Jeremy the Brave",
    latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

exports.test_game_workflow = function(test) {
    var user_id = "Bob the tester";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    // Test that invalid game is rejected
    test.strictEqual(false, controller.join_game(game_id, user_id, user), "Should not allow user to join game before it is created");
    test.notStrictEqual(null, controller.update_location(game_id, user_id, user), "Should not allow user to update their location before joining");
    
    // Create game
    test.ok(controller.create_game(game_id, user.latitude, user.longitude), "Could not create game");
    
    // Join game
    test.ok(controller.join_game(game_id, user_id, user), "Could not join game");
    
    // Update location
    test.strictEqual(null, controller.update_location(game_id, user_id, user), "Could not update location");
    
    // Get location
    test.ok(controller.get_location(game_id));
    
    test.done();
};

exports.test_flag_race_condition = function(test) {
    var game_id = "test-game-workflow";
    
    // Create game
    test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    test.ok(controller.join_game(game_id, user2.id, user2), "user2 could not join game");
    test.ok(controller.join_game(game_id, user3.id, user3), "user3 could not join game");
    user1.latitude += TWENTY_FEET;
    user2.latitude -= TWENTY_FEET;
    user3.latitude += TWENTY_FEET;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.strictEqual(true, algorithms.in_rectangle(user1.latitude, user1.longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), 'Player 1 not where expected');
    test.strictEqual(true, algorithms.in_rectangle(user3.latitude, user3.longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), 'Player 1 not where expected');
    test.strictEqual(true, algorithms.in_rectangle(user2.latitude, user2.longitude,
            ctf.game_data[game_id].blue_bounds.top_left.latitude, ctf.game_data[game_id].blue_bounds.top_left.longitude,
            ctf.game_data[game_id].blue_bounds.bottom_right.latitude, ctf.game_data[game_id].blue_bounds.bottom_right.longitude), 'Player 1 not where expected');
    
    // Have two red players reach flag at the same time
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that last to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].has_flag, "user1 doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].has_flag, "user3 has the flag");
    
    // Test that flag is captured
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    
    // Move player with flag to own side
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Move other red player away from flag
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude + (TWENTY_FEET * 2);
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that flag is not captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The flag is still captured");
    
    // Move other red player back on flag
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Test that flag is captured again
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    
    // Move to own side
    user3.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user3.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that flag is not captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    test.done();    
};