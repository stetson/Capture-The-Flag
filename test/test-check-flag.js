logic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();

algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

exports.test_flag = function(test) {
    var user_id = "Laura the Great";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    // Set up game
    controller.create_game(game_id, user.latitude, user.longitude);
    controller.join_game(game_id, user_id, user);
    
    // Put them in their territory
    ctf.game_data[game_id].players[user_id].latitude += .001;
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user_id].latitude, ctf.game_data[game_id].players[user_id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "The user is not starting the test in their territory");
    
    // Make sure user doesn't have flag
    test.strictEqual(false, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");
    
    // Move player over flag
    user.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user.longitude = ctf.game_data[game_id].blue_flag.longitude;
    controller.update_location(game_id, user_id, user);
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // User should now have flag
    test.strictEqual(true, ctf.game_data[game_id].players[user_id].has_flag, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The blue flag should be captured");
    
    // Move the user back into their own territory
    user.latitude = ctf.game_data[game_id].origin.latitude + .001;
    user.longitude = ctf.game_data[game_id].origin.longitude;
    controller.update_location(game_id, user_id, user);
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
     
    // User should no longer have flag
    test.strictEqual(false, ctf.game_data[game_id].players[user_id].has_flag, "The user still has the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The blue flag shold not captured now");
    
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