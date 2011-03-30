global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");
logic_class = require("../modules/build/default/Logic.node");

var logic = new logic_class.Logic();
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

var TWENTY_FEET = 0.000001;
var HALF_FIELD = 0.25;

// Test data
exports.test_observer = function(test) {
    var user_id = "Bob the tester";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,    // 29°02′04.9″N
        longitude: -81.303774   // 81°18′13.6″W
    };
    
    // Create game
    test.ok(controller.create_game(game_id, user.latitude, user.longitude), "Could not create game");
    controller.create_game(game_id, user.latitude, user.longitude);
        
    // Join game
    test.ok(controller.join_game(game_id, user_id, user), "Could not join game");
    
    // Test that user is in observer mode to start
    test.strictEqual(true, ctf.game_data[game_id].players[user_id].observer_mode, "User did not start in observer mode");
    
    // Run the business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that user is now out of observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[user_id].observer_mode, "User is still in observer mode, even though they are in their own territory");
    
    // Move out of bounds
    user.latitude = 31.503629; // China :-)
    user.longitude = 121.289063;
    test.strictEqual(null, controller.update_location(game_id, user_id, user), "Could not move out of bounds");

    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that user is back in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[user_id].observer_mode, "User is out of bounds, and therefore should be in observer mode");
    
    test.done();
};
