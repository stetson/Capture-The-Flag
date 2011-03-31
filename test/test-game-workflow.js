global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

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
    // Create game
    // Have three players join
    // Have two red players reach flag at the same time
    // Test that first to join has flag
    // Test that flag is captured
    // Move player with flag to own side
    // Move other red player away from flag
    // Test that flag is no longer captured
    // Move other red player back on flag
    // Test that flag is captured again
    // Move to own side
    // Test that flag is no longer captured
    test.done();    
};