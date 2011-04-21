var controller = require("../backend/controller.js");
var TWENTY_FEET = 0.000001;
// NOTE - copied this from Logic.h (don't know how to expose it to js)
var TOLERANCE = .005;
// NOTE - you have to assign this to the variable you use below
var logic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();

var algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();


exports.test_observer_tagging = function(test) {
    var game_id = "test_observer_tagging";
	
    var Red1 = {
		id: "Red1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    // NOTE - Preconditions will fail if you don't put the blue player in her territory
    var Blue1 = {
		id: "Blue1",
        latitude: Red1.latitude - TWENTY_FEET,
        longitude: Red1.longitude    
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
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should not be in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 should not be in observer mode");
   
    // Move Red1 to blue flag area near edge
    var new_coordinates = algorithms.add_miles_to_coordinate(
            ctf.game_data[game_id].blue_flag.latitude, 
            ctf.game_data[game_id].blue_flag.longitude, TOLERANCE, 0);
    Red1.latitude = new_coordinates.latitude;
    Red1.longitude = new_coordinates.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not move player to edge of tolerance");
	
	// Update logic
    logic.run(ctf.game_data[game_id]);
    
	// Check to see if Red1 has flag
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 does not have the flag");

    // NOTE - you are not moving Blue1 outside the field,
    // and even if you did, they would be in observer mode no matter what
    
    // Move Blue1 to outside field but within tagging range of Red1
    var new_coordinates = algorithms.add_miles_to_coordinate(
            ctf.game_data[game_id].blue_bounds.bottom_right.latitude, 
            ctf.game_data[game_id].blue_bounds.bottom_right.longitude, TOLERANCE, 270);
    Blue1.latitude = new_coordinates.latitude;
    Blue1.longitude = new_coordinates.longitude;
    test.strictEqual(null, controller.update_location(game_id, Blue1.id, Blue1));
    
    // Move red to corner of field
    Red1.latitude = ctf.game_data[game_id].blue_bounds.bottom_right.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_bounds.bottom_right.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1));
	
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
        latitude: Red1.latitude - TWENTY_FEET,
        longitude: Red1.longitude   
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
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should not be in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 should not be in observer mode");
	
    // Move Red1 to blue flag area
    Red1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not move Red1");
	
	// Update logic
    logic.run(ctf.game_data[game_id]);
	
	// Check if Red1 is in observer mode
	test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should not be in observer mode");

    // Check to see if Red1 has flag
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 should have the flag");

    // Move Blue1 to tagging distance of Red1 within field
    Blue1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Blue1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Blue1.id, Blue1), "Could not move Blue1");
    
	// Update logic
    for (var i = 0; i < 100; i++) {
        logic.run(ctf.game_data[game_id]);
    }
	
    // Check to see if Red1 is in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should be in observer mode");
    
	// Make sure Red1 does not have the flag
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 should not have the flag");
	
	// Check that Blue1 has 1 tag
    test.equal(1, ctf.game_data[game_id].players[Blue1.id].tags, "Blue1 should only have one tag");

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
        latitude: Red1.latitude - TWENTY_FEET,
        longitude: Red1.longitude    
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
    test.equal(0, ctf.game_data[game_id].players[Red1.id].captures, "Red1 should not have any captures");
    test.equal(0, ctf.game_data[game_id].players[Blue1.id].tags, "Blue1 should not have any tags");
    
    // Move Red1 to near his own side near the border
    var near_border = algorithms.add_miles_to_coordinate(ctf.game_data[game_id].origin.latitude,
            ctf.game_data[game_id].origin.longitude, (TOLERANCE / 3), 0);
    Red1.latitude =  near_border.latitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not move Red1");

    // Move the Blue flag to near the border on the Blue side
    var near_border = algorithms.add_miles_to_coordinate(ctf.game_data[game_id].origin.latitude,
            ctf.game_data[game_id].origin.longitude, (TOLERANCE / 3), 180);
    test.strictEqual(null, controller.move_flag(game_id, Red1.id, "blue",
            near_border.latitude, near_border.longitude));

    // Update logic
    for (var i = 0; i < 100; i++) {
        logic.run(ctf.game_data[game_id]);
    }

    // Check if Red1 is in observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 is in observer mode");

    // Check if Red 1 has the flag
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 does have the flag");
    
    // Check that Red1 has no captures
    test.equal(0, ctf.game_data[game_id].players[Red1.id].captures, "Red1 should not have any captures");
    
    // Check that Blue1 has no tags
    test.equal(0, ctf.game_data[game_id].players[Blue1.id].tags, "Blue1 should not have any tags");
    
test.done();
};

exports.test_double_tag_over_flag = function(test) {
    var game_id = "test_double_tag_over_flag";

	 var Red1 = {
        id: "Red1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    var Blue1 = {
        id: "Blue1",
        latitude: Red1.latitude - TWENTY_FEET,
        longitude: Red1.longitude    
    };
	
	var Red2 = {
        id: "Red2",
        latitude: Red1.latitude,
        longitude: Red1.longitude - TWENTY_FEET    
    };
	
    // Create game
    test.ok(controller.create_game(game_id, Red1.id, Red1.latitude, Red1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, Red1.id, Red1), "Red1 could not join game"); // Red team
    test.ok(controller.join_game(game_id, Blue1.id, Blue1), "Blue1 could not join game"); // Blue team
	test.ok(controller.join_game(game_id, Red2.id, Red2), "Red2 could not join game"); // Red team
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.equal("red", ctf.game_data[game_id].players[Red1.id].team, "Red1 should be on the red team");
    test.equal("blue", ctf.game_data[game_id].players[Blue1.id].team, "Blue1 should be on the blue team");
	test.equal("red", ctf.game_data[game_id].players[Red2.id].team, "Red2 should be on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should not be in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 should not be in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Red2.id].observer_mode, "Red2 should not be in observer mode");	
    
    // Have two red players reach flag at the same time
    Red1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not update Red1's location to blue flag");
    Red2.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red2.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red2.id, Red2), "Could not update Red2's location to blue flag");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that first to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 should have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[Red2.id].has_flag, "Red2 should not have the flag");

    // Player on blue team tags both red players
    Blue1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Blue1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Blue1.id, Blue1), "Could not update Blue1's location to blue flag");

    // Update logic
    for (var i = 0; i < 100; i++) {
        logic.run(ctf.game_data[game_id]);
	}
	
    // Test that player 1 no longer has the flag
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 should not have the flag");
	
	// Check that Red1 has no captures
    test.equal(0, ctf.game_data[game_id].players[Red1.id].captures, "Red1 should not have any captures");
    
    // Check that Blue1 has only 2 tags
    test.equal(2, ctf.game_data[game_id].players[Blue1.id].tags, "Blue1 should only have two tags");

    // Test that both players are in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should be in observer mode");
    test.strictEqual(true, ctf.game_data[game_id].players[Red2.id].observer_mode, "Red2 should be in observer mode");
	
    test.done();
};

exports.test_capture_after_point = function(test) {
    var game_id = "test_capture_after_point";
	
	var Red1 = {
        id: "Red1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    var Blue1 = {
        id: "Blue1",
        latitude: Red1.latitude - TWENTY_FEET,
        longitude: Red1.longitude    
    };
	
	var Red2 = {
        id: "Red2",
        latitude: Red1.latitude,
        longitude: Red1.longitude - TWENTY_FEET    
    };
	
    // Create game
    test.ok(controller.create_game(game_id, Red1.id, Red1.latitude, Red1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, Red1.id, Red1), "Red1 could not join game"); // Red
    test.ok(controller.join_game(game_id, Blue1.id, Blue1), "Blue1 could not join game"); // Blue
    test.ok(controller.join_game(game_id, Red2.id, Red2), "Red2 could not join game"); // Red
       
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test preconditions
    test.equal("red", ctf.game_data[game_id].players[Red1.id].team, "Red1 isn't on the red team");
    test.equal("blue", ctf.game_data[game_id].players[Blue1.id].team, "Blue1 should be on the red team");
    test.equal("red", ctf.game_data[game_id].players[Red2.id].team, "Red2 should be on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should not be in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 should not be in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Red2.id].observer_mode, "Red2 should not be in observer mode");
    
    // Have two red players reach flag at the same time
    Red1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not update Red1's location to blue flag");
    Red2.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red2.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red2.id, Red2), "Could not update Red2's location to blue flag");

    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that first to join has flag
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 should have the flag");
    test.strictEqual(false, ctf.game_data[game_id].players[Red2.id].has_flag, "Red2 should not have the flag");

    // Test that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The red flag should not be captured");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The blue flag should be captured");   

    // Move Red1 with flag to own side
    Red1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    Red1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not update Red1's location to red side");
    
    // Update logic
    logic.run(ctf.game_data[game_id]);

    // Test that Red2 now has the flag
    test.strictEqual(true, ctf.game_data[game_id].players[Red2.id].has_flag, "Red2 should have the flag");

    test.done();    
};

exports.test_no_capture_in_observer_mode = function(test) {
    var game_id = "test_no_capture_in_observer_mode";

	var Red1 = {
        id: "Red1",
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    var Blue1 = {
        id: "Blue1",
        latitude: Red1.latitude - TWENTY_FEET,
        longitude: Red1.longitude    
    };
	
    // Create game
    test.ok(controller.create_game(game_id, Red1.id, Red1.latitude, Red1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, Red1.id, Red1), "Red1 could not join game");
    test.ok(controller.join_game(game_id, Blue1.id, Blue1), "Blue1 could not join game");
        
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.equal("red", ctf.game_data[game_id].players[Red1.id].team, "Red1 should be on the red team");
    test.equal("blue", ctf.game_data[game_id].players[Blue1.id].team, "Blue1 should be on the red team");
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should not be in observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[Blue1.id].observer_mode, "Blue1 should not be in observer mode");
    
    // Have a red player reach the flag 
    Red1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not update Red1's location to blue flag");

	// Run business logic
    logic.run(ctf.game_data[game_id]);
	
    // Test that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].red_flag_captured, "The red flag should not be captured");
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The blue flag should be captured");

    // Move out of bounds
    Red1.latitude = ctf.game_data[game_id].blue_bounds.bottom_right.latitude + TWENTY_FEET;
    Red1.longitude = ctf.game_data[game_id].blue_bounds.bottom_right.longitude + TWENTY_FEET;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not update Red1's location to out of bounds");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);

    // Test that player 1 is in observer mode
    test.strictEqual(true, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should be in observer mode");

	// Test that player does not have the blue flag
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 should not have the flag");

    // Test that flag is not captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");

    // Have a red and blue player reach the flag
    Red1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Red1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not update Red1's location to blue flag");
    Blue1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    Blue1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, Blue1.id, Blue1), "Could not update Blue1's location to blue flag");
   
    // Update logic
    for (var i = 0; i < 100; i++) {
        logic.run(ctf.game_data[game_id]);
	}

    // Test that player does not have the blue flag
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].has_flag, "Red1 should not have the blue flag");

    // Test that flag is not captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");
	
	// Test that Blue1 did not make any tags
	test.equal(0, ctf.game_data[game_id].players[Blue1.id].tags, "Blue1 should not have any tags");

    // Move player back into territory
    Red1.latitude = ctf.game_data[game_id].origin.latitude + TWENTY_FEET;
    Red1.longitude = ctf.game_data[game_id].origin.longitude;
    test.strictEqual(null, controller.update_location(game_id, Red1.id, Red1), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that player is out of observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[Red1.id].observer_mode, "Red1 should not be in observer mode");

    test.done();    
};

exports.test_double_entente = function(test) {
    var game_id = "test_double_entente";
    var user1 = {
            id: "Bob the tester",
            latitude: 29.034681,
            longitude: -81.303774     
    };
    
    var user2 = {
            id: "Dan the man",
            latitude: 29.034681,
            longitude: -81.303774     
    };
    
    // Create game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "Could not join game");
    test.ok(controller.join_game(game_id, user2.id, user2), "Could not join game");
    
    // Flag sit
    user1.latitude = ctf.game_data[game_id].red_flag.latitude;
    user1.longitude = ctf.game_data[game_id].red_flag.longitude;
    user2.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user2.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to starting point");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to starting point");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.strictEqual(true, algorithms.in_rectangle(user1.latitude, user1.longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), 'Player 1 not where expected');
    test.strictEqual(true, algorithms.in_rectangle(user2.latitude, user2.longitude,
            ctf.game_data[game_id].blue_bounds.top_left.latitude, ctf.game_data[game_id].blue_bounds.top_left.longitude,
            ctf.game_data[game_id].blue_bounds.bottom_right.latitude, ctf.game_data[game_id].blue_bounds.bottom_right.longitude), 'Player 1 not where expected');
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "user1 got put into observer mode");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "user2 got put into observer mode");
    test.equal(0, ctf.game_data[game_id].players[user1.id].tags, "User1 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user2.id].tags, "User2 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user1.id].captures, "User1 has a capture");
    test.equal(0, ctf.game_data[game_id].players[user2.id].captures, "User2 has a capture");
    test.equal(0, ctf.game_data[game_id].red_score, "Red score is not 0");
    test.equal(0, ctf.game_data[game_id].blue_score, "Blue score is not 0");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "user1 does not have flag");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].has_flag, "user1 does not have flag");
    
    // Double capture
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    user2.latitude = ctf.game_data[game_id].red_flag.latitude;
    user2.longitude = ctf.game_data[game_id].red_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to flag");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to flag");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test that both players have the flag
    test.ok(ctf.game_data[game_id].players[user1.id].has_flag, "user1 does not have flag");
    test.ok(ctf.game_data[game_id].players[user2.id].has_flag, "user2 does not have flag");
    
    // Move both players within range of each other across the boundary line
    user1_new_location = algorithms.add_miles_to_coordinate(
            ctf.game_data[game_id].origin.latitude,
            ctf.game_data[game_id].origin.longitude, (TOLERANCE / 3), 180);
    user2_new_location = algorithms.add_miles_to_coordinate(
            ctf.game_data[game_id].origin.latitude,
            ctf.game_data[game_id].origin.longitude, (TOLERANCE / 3), 0);
    user1.latitude = user1_new_location.latitude;
    user1.longitude = user1_new_location.longitude;
    user2.latitude = user2_new_location.latitude;
    user2.longitude = user2_new_location.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to border");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to border");
    
    // Run business logic
    for (var i = 0; i < 100; i++) {
        logic.run(ctf.game_data[game_id]);
    }
    
    // Test that tags and captures are 0 and no one is in observer mode
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "User1 has a tag");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "User2 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user1.id].tags, "User1 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user2.id].tags, "User2 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user1.id].captures, "User1 has a capture");
    test.equal(0, ctf.game_data[game_id].players[user2.id].captures, "User2 has a capture");
    test.equal(0, ctf.game_data[game_id].red_score, "Red score is not 0");
    test.equal(0, ctf.game_data[game_id].blue_score, "Blue score is not 0");
    
    // Swap places
    user1_new_location = algorithms.add_miles_to_coordinate(
            ctf.game_data[game_id].origin.latitude,
            ctf.game_data[game_id].origin.longitude, (TOLERANCE / 3), 0);
    user2_new_location = algorithms.add_miles_to_coordinate(
            ctf.game_data[game_id].origin.latitude,
            ctf.game_data[game_id].origin.longitude, (TOLERANCE / 3), 180);
    user1.latitude = user1_new_location.latitude;
    user1.longitude = user1_new_location.longitude;
    user2.latitude = user2_new_location.latitude;
    user2.longitude = user2_new_location.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location to border");
    test.strictEqual(null, controller.update_location(game_id, user2.id, user2), "Could not update location to border");
    
    // Run business logic
    for (var i = 0; i < 100; i++) {
        logic.run(ctf.game_data[game_id]);
    }
    
    // Test that both players have no tags and 1 capture each, and that scores have been incremented
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "User1 has a tag");
    test.strictEqual(false, ctf.game_data[game_id].players[user2.id].observer_mode, "User2 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user1.id].tags, "User1 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user2.id].tags, "User2 has a tag");
    test.equal(1, ctf.game_data[game_id].players[user1.id].captures, "User1 has a capture");
    test.equal(1, ctf.game_data[game_id].players[user2.id].captures, "User2 has a capture");
    test.equal(1, ctf.game_data[game_id].red_score, "Red score is not 1");
    test.equal(1, ctf.game_data[game_id].blue_score, "Blue score is not 1");
    
    test.done();
};
