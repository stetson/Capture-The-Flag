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

var user4 = {
    id: "Player 4",
    latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

var user5 = {
    id: "Player 5",
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
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 got put into observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "user2 got put into observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user3 got put into observer mode");
    
    // Have two red players reach flag at the same time
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that first to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].has_flag, "user1 doesn't have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].has_flag, "user3 has the flag");
    
    // Test that no one is in observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 got put into observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "user2 got put into observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user3 got put into observer mode");
    
    // Test that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    
    // Move player with flag to own side
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Move other red player away from flag
    new_position = algorithms.add_miles_to_coordinate(user3.latitude, user3.longitude, 0.1, 45);
    user3.latitude = new_position.latitude;
    user3.longitude = new_position.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user3 got put into observer mode");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that flag is not captured and that no one has the flag
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user3 got put into observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "user1 has the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].has_flag, "user3 has the flag");
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The flag is still captured");
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The user doesn't have the flag");
    
    // Move other red player back on flag
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
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
    
    // Test that invalid game is rejected
    test.strictEqual(false, controller.join_game(game_id, user_id, user), "Should not allow user to join game before it is created");
    test.notStrictEqual(null, controller.update_location(game_id, user_id, user), "Should not allow user to update their location before joining");
    
    // Create game
    test.ok(controller.create_game(game_id, user.latitude, user.longitude), "Could not create game");
    
    // Join game
    test.ok(controller.join_game(game_id, user_id, user), "Could not join game");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user_id].observer_mode, "No observer mode");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user_id].team, "No team");
    
    // Update location
    test.strictEqual(null, controller.update_location(game_id, user_id, user), "Could not update location");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user_id].observer_mode, "No observer mode");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user_id].team, "No team");
    
    // Get location
    test.ok(controller.get_location(game_id));
    
    test.done();
};
    
    exports.test_game_scenario1 = function(test) {
    var game_id = "test-game-scenario1";

    // Create game
    test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    test.ok(controller.join_game(game_id, user3.id, user3), "user3 could not join game");
    test.ok(controller.join_game(game_id, user4.id, user4), "user4 could not join game");
   
    user1.latitude -= TWENTY_FEET;
    user3.latitude += TWENTY_FEET;
    user4.latitude += TWENTY_FEET;

    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Have two red players reach flag at the same time
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    user4.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user4.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that first to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[user3.id].has_flag, "user3 does not have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user4.id].has_flag, "user4 has the flag");

    //Blue team tags red flag carrier and bystander
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

   // Test that player 3 no longer has the flag
   test.strictEqual(false, ctf.game_data[game_id].players[user3.id].has_flag, "user3 does not have the flag");

    // Test that both players are in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[user3.id].observer_mode, "user3 did not get put in observer mode");
    test.strictEqual(true, ctf.game_data[game_id].players[user4.id].observer_mode, "user4 did not get put into observer mode");
    test.done();
};
    exports.test_game_scenario2 = function(test) {
    var game_id = "test-game-scenario2";

    // Create game
    test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    test.ok(controller.join_game(game_id, user3.id, user3), "user3 could not join game");
    test.ok(controller.join_game(game_id, user4.id, user4), "user4 could not join game");
   
    user1.latitude -= TWENTY_FEET;
    user3.latitude += TWENTY_FEET;
    user4.latitude += TWENTY_FEET;

    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Have two red players reach flag at the same time
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    user4.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user4.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that first to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[user3.id].has_flag, "user3 does not have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user4.id].has_flag, "user4 has the flag flag");

    // Test that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");   

    // Move player 3 with flag to own side
    user3.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user3.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");

    // Test that player 4 now has the flag
    test.strictEqual(true, ctf.game_data[game_id].players[user4.id].has_flag, "user4 does not have the flag");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    test.done();    
};

    exports.test_game_scenario3 = function(test) {
    var game_id = "test-game-scenario3";

    // Create game
    test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    test.ok(controller.join_game(game_id, user3.id, user3), "user3 could not join game");
    
    user1.latitude -= TWENTY_FEET;
    user3.latitude += TWENTY_FEET;

    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Have a red player reach the flag 
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");

    // Test that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");

    // Move out of bounds
    user3.latitude = 31.503629; 
    user3.longitude = 121.289063;
    //user3.latitude = ctf.game_data[game_id].blue_bounds.bot_right.latitude - TWENTY_FEET;
    //user3.longitude = ctf.game_data[game_id].blue_bounds.bot_right.longitude - TWENTY_FEET;

    // Test that player 3 is in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].observer_mode, "user3 got put into observer mode");

    // Have a red and blue player reach the flag
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that player does not have the blue flag
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].has_flag, "user3 does not have the flag");

    // Test that flag is not captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");

    // Move player back into territory
    user3.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user3.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    // Test that player 3 is out of observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user3 got put out of observer mode");

    test.done();    
};
/*
exports.test_observer_tagging = function(test) {
	var user_id = "Red1";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
	
	var user_id = "Blue1";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
	
	var user_id = "Red2";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
	
	//Move Red1 to blue flag area
	
	//Check to see if Red1 has flag
	
	//Move Blue1 to outside field but within tagging range of Red1
	
	//Update logic
	
	//Check that Blue1 is in observer mode
	
	//Check to see if Red1 is still active and has flag

test.done();
};

exports.test_tagging = function(test) {
	var user_id = "Red1";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
	
	var user_id = "Blue1";
    var game_id = "test_game";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774    
	};
		//Move Red1 to blue flag area
		
		//Check to see if Red1 has flag
		
		//Move Blue1 to tagging distance of Red1 within field
		
		//Update logic
		
		//Check to see if Red1 is in observer mode
		
		//Check to see if Red1 has the flag
    

test.done();
};*/