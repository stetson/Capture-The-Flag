/**
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
    
    // Test that invalid game is rejected
    test.strictEqual(false, controller.join_game(game_id, user_id, user), "Should not allow user to join game before it is created");
    test.strictEqual(false, controller.update_location(game_id, user_id, user), "Should not allow user to update their location before joining");
    
    // Create game
    test.ok(controller.create_game(game_id, user.latitude, user.longitude), "Could not create game");
    
    // Have the user join the game
    test.ok(controller.join_game(game_id, user_id, user), "Could not join game");
    
    // Put them in their territory
    ctf.game_data[game_id].players[user_id].latitude += .001;
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user_id].latitude, ctf.game_data[game_id].players[user_id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "The user is not starting the test in their territory");
    
    // Test team
    test.equal("red", ctf.game_data[game_id].players[user_id].team, "The user is not on the right team");
    
    // Test team has right flag
    test.equal("red", ctf.game_data[game_id].players[user_id].flag, "The user did not capture the right flag");
    
    // Test captured flag
    test.strictEqual(true, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");
    
    // Give player flag
    ctf.game_data[game_id].players[user_id].has_flag = true;
    test.strictEqual(true, ctf.game_data[game_id].players[user_id].has_flag, "The user doesn't have the flag");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
     
    // Test has_flag
    test.strictEqual(false, ctf.game_data[game_id].players[user_id].has_flag, "The user still has the flag");
    
    test.done();
};
*/
