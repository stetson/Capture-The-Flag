logic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();

algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

var game_id = "test_game";

var user1 = {
    id: "George",
    latitude: 29.034681,
    longitude: -81.303774     
};

var user2 = {
    id: "Fred",
    latitude: user1.latitude - 0.001,
    longitude: user1.longitude
};

exports.test_win = function(test) {

        
    // Create game
    test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
    
    // Have the user join the game
    test.ok(controller.join_game(game_id, user1.id, user1), "Could not join game (player 1)");
    test.ok(controller.join_game(game_id, user2.id, user2), "Could not join game (player 2)");
    
    // Move player 1 into their own territory
    user1.latitude += 0.001;
    controller.update_location(game_id, user1.id, user1);
    
    // Check that each player is in their own territory
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user1.id].latitude, ctf.game_data[game_id].players[user1.id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "Player 1 is not starting the test in their territory");
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user2.id].latitude, ctf.game_data[game_id].players[user2.id].longitude,
            ctf.game_data[game_id].blue_bounds.top_left.latitude, ctf.game_data[game_id].blue_bounds.top_left.longitude,  
            ctf.game_data[game_id].blue_bounds.bottom_right.latitude, ctf.game_data[game_id].blue_bounds.bottom_right.longitude), "Player 1 is not starting the test in their territory");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Player 1 observer_mode should be false
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "Player 1 not starting in observer mode");
    
    // Player 2 observer_mode should be false
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "Player 2 not starting in observer mode");
    
    // Move player 2 right on top of player 1
    user2.latitude = user1.latitude;
    controller.update_location(game_id, user2.id, user2);
    
    // Check that both players are in the red territory
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user1.id].latitude, ctf.game_data[game_id].players[user1.id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "Player 1 should be in the red territory");
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user2.id].latitude, ctf.game_data[game_id].players[user2.id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "Player 2 should be in the red territory");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Player 1 observer_mode should be false
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "Player 1 is not still in observer mode");
    
    // Player 2 observer_mode should be true
    test.strictEqual(true, ctf.game_data[game_id].players[user2.id].observer_mode, "Player 2 should be in observer mode");

    test.done();
};