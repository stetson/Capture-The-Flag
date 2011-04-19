var controller = require("../backend/controller.js");
var TWENTY_FEET = 0.000001;
ogic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();
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

exports.test_observer_tagging = function(test) {
    var game_id = "test_observer_tagging";
	
    var Red1 = {
		id: "Red1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    var Blue1 = {
		id: "Blue1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
	
	// Create game
    test.ok(controller.create_game(game_id, Red1.id, Red1.latitude, Red1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, Red1.id, Red1), "Red1 could not join game"); // Red team
    test.ok(controller.join_game(game_id, Blue1.id, Blue1), "Blue1 could not join game"); // Blue team
   
    // Run business logic
    logic.run(ctf.game_data[game_id]);
	
	// Test preconditions
    test.equal("red", ctf.game_data[game_id].players[Red1.id].team, "Red1 isn't on the red team");
    test.equal("blue", ctf.game_data[game_id].players[Blue1.id].team, "Blue1 isn't on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 is in observer mode");
   
    // Move Red1 to blue flag area near edge
    Red1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_flag.longitude;
	Red1.latitude += TWENTY_FEET/2;
	
	// Update logic
    logic.run(ctf.game_data[game_id]);
    
	// Check to see if Red1 has flag
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 does not have the flag");

    // Move Blue1 to outside field but within tagging range of Red1
    Blue1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Blue1.longitude = ctf.game_data[game_id].blue_flag.longitude;
	Blue1.latitude += TWENTY_FEET;
	
    // Update logic
    logic.run(ctf.game_data[game_id]);
    
    // Check that Red1 is not in observer mode
	test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 is in observer mode");
	
	// Check that Blue1 is in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 is not in observer mode");
	
    // Check to see if Red1 has flag
	test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 does not have the flag");

    test.done();
};
	
exports.test_observer_capturing = function(test){
    var game_id = "test_observer_capturing";

    var Red1 = {
		id: "Red1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    var Blue1 = {
		id: "Blue1",
        latitude: 29.034681,
        longitude: -81.303774    
    };

	// Create game
    test.ok(controller.create_game(game_id, Red1.id, Red1.latitude, Red1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, Red1.id, Red1), "Red1 could not join game"); // Red team
    test.ok(controller.join_game(game_id, Blue1.id, Blue1), "Blue1 could not join game"); // Blue team

	// Run business logic
    logic.run(ctf.game_data[game_id]);
	
	// Test preconditions
    test.equal("red", ctf.game_data[game_id].players[Red1.id].team, "Red1 isn't on the red team");
    test.equal("blue", ctf.game_data[game_id].players[Blue1.id].team, "Blue1 isn't on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 is in observer mode");
	
    // Move Red1 to blue flag area
    Red1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_flag.longitude;
	
	// Update logic
    logic.run(ctf.game_data[game_id]);
	
    // Check to see if Red1 has flag
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 does not have the flag");

    // Move Blue1 to tagging distance of Red1 within field
    Blue1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Blue1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    
	// Update logic
    logic.run(ctf.game_data[game_id]);
	 
    // Check to see if Red1 is in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 did not get put in observer mode");
    
	// Make sure Red1 does not have the flag
    test.notEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 does not have the flag");

    test.done();
};

exports.test_capturing_over_team_bounds = function(test){
	var game_id = "test_capturing_over_team_bounds";

    var Red1 = {
		id: "Red1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    var Blue1 = {
		id: "Blue1",
        latitude: 29.034681,
        longitude: -81.303774    
    };
	
	// Create game
	test.ok(controller.create_game(game_id, Red1.id, Red1.latitude, Red1.longitude), "Could not create game");
	test.ok(controller.join_game(game_id, Red1.id, Red1), "Red1 could not join game"); // Red team
    test.ok(controller.join_game(game_id, Blue1.id, Blue1), "Blue1 could not join game"); // Blue team

	// Run business logic
    logic.run(ctf.game_data[game_id]);
	
	// Test preconditions
    test.equal("red", ctf.game_data[game_id].players[Red1.id].team, "Red1 isn't on the red team");
    test.equal("blue", ctf.game_data[game_id].players[Blue1.id].team, "Blue1 isn't on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 is in observer mode");
	
	// Move Red1 to near his own side near the border
    Red1.latitude = ctf.game_data[game_id].origin.latitude - TWENTY_FEET/2;
    Red1.longitude = ctf.game_data[game_id].origin.longitude;
	/*
	//Move the Blue flag to near the border on the Blue side
	ctf.game_data[game_id].blue_flag.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET/2;
	ctf.game_data[game_id].blue_flag.longitude = ctf.game_data[game_id].origin.longitude;
*/
	// Update logic
    logic.run(ctf.game_data[game_id]);

	// Check if Red1 is in observer mode
	test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 is not in observer mode");

	// Check if Red 1 has the flag
	test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 does have the flag");
	
test.done();
};

exports.test_double_tag_over_flag = function(test) {
    var game_id = "test_double_tag_over_flag";

    // Create game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game"); // Red team
    test.ok(controller.join_game(game_id, user3.id, user3), "user3 could not join game"); // Blue team
    test.ok(controller.join_game(game_id, user4.id, user4), "user4 could not join game"); // Red team
   
    user1.latitude += TWENTY_FEET;
    user3.latitude -= TWENTY_FEET;
    user4.latitude += TWENTY_FEET;

    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.equal("red", ctf.game_data[game_id].players[user1.id].team, "User 1 isn't on the red team");
    test.equal("blue", ctf.game_data[game_id].players[user3.id].team, "User 3 isn't on the red team");
    test.equal("red", ctf.game_data[game_id].players[user4.id].team, "User 4 isn't on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user 1 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user 3 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user4.id].observer_mode, "user 4 is in observer mode");
    
    // Have two red players reach flag at the same time
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    user4.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user4.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that first to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].has_flag, "user3 does not have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user4.id].has_flag, "user4 has the flag");

    // Player on blue team tags both red players
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that player 1 no longer has the flag
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "user3 does not have the flag");

    // Test that both players are in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].observer_mode, "user3 did not get put in observer mode");
    test.strictEqual(true, ctf.game_data[game_id].players[user4.id].observer_mode, "user4 did not get put into observer mode");
    test.done();
};

exports.test_capture_after_point = function(test) {
    var game_id = "test_capture_after_point";

    // Create game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game"); // Red
    test.ok(controller.join_game(game_id, user3.id, user3), "user3 could not join game"); // Blue
    test.ok(controller.join_game(game_id, user4.id, user4), "user4 could not join game"); // Red
   
    user1.latitude += TWENTY_FEET;
    user3.latitude -= TWENTY_FEET;
    user4.latitude += TWENTY_FEET;

    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test preconditions
    test.equal("red", ctf.game_data[game_id].players[user1.id].team, "User 1 isn't on the red team");
    test.equal("blue", ctf.game_data[game_id].players[user3.id].team, "User 3 isn't on the red team");
    test.equal("red", ctf.game_data[game_id].players[user4.id].team, "User 4 isn't on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user 1 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user 3 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user4.id].observer_mode, "user 4 is in observer mode");
    
    // Have two red players reach flag at the same time
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    user4.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user4.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user4.id, user4), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that first to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].has_flag, "user3 does not have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user4.id].has_flag, "user4 has the flag flag");

    // Test that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");   

    // Move player 1 with flag to own side
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that player 4 now has the flag
    test.strictEqual(true, ctf.game_data[game_id].players[user4.id].has_flag, "user4 does not have the flag");

    test.done();    
};

exports.test_no_capture_in_observer_mode = function(test) {
    var game_id = "test_no_capture_in_observer_mode";

    // Create game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    test.ok(controller.join_game(game_id, user3.id, user3), "user3 could not join game");
    
    user1.latitude += TWENTY_FEET;
    user3.latitude -= TWENTY_FEET;

    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Have a red player reach the flag 
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");

    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.equal("red", ctf.game_data[game_id].players[user1.id].team, "User 1 isn't on the red team");
    test.equal("blue", ctf.game_data[game_id].players[user3.id].team, "User 3 isn't on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user 1 is in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user3.id].observer_mode, "user 3 is in observer mode");
    
    // Test that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The user doesn't have the flag");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");

    // Move out of bounds
    user1.latitude = ctf.game_data[game_id].blue_bounds.bottom_right.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].blue_bounds.bottom_right.longitude + TWENTY_FEET;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to out of bounds");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that player 1 is in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[user1.id].observer_mode, "user3 got put into observer mode");

    // Have a red and blue player reach the flag
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to flag");
    user3.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user3.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user3.id, user3), "Could not update location to flag");
   
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that player does not have the blue flag
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "user3 does not have the flag");

    // Test that flag is not captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");

    // Move player back into territory
    user1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    user1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that player is out of observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user3 got put out of observer mode");

    test.done();    
};
