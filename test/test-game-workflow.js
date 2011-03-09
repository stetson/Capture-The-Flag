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
    test.strictEqual(false, controller.update_location(game_id, user_id, user), "Should not allow user to update their location before joining");
    
    // Create game
    test.ok(controller.create_game(game_id, user.latitude, user.longitude), "Could not create game");
    
    // Join game
    test.ok(controller.join_game(game_id, user_id, user), "Could not join game");
    
    // Update location
    test.ok(controller.update_location(game_id, user_id, user), "Could not update location");
    
    // Get location
    test.ok(controller.get_location(game_id));
    
    test.done();
};