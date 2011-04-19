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
    var game_id = "test_workflow";
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
    var user3 = {
            id: "Dan the man",
            latitude: 29.034681,
            longitude: -81.303774     
    };
        
    // Test that invalid game is rejected
    test.strictEqual(false, controller.join_game(game_id, user1.id, user1), "Should not allow user to join game before it is created");
    test.notStrictEqual(null, controller.update_location(game_id, user1.id, user1), "Should not allow user to update their location before joining");
    
    // Create game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
    
    // Ensure points are as expected
    test.equal(ctf.game_data[game_id].origin.latitude, ctf.game_data[game_id].red_bounds.bottom_right.latitude, "Red bounds are not drawn right");
    test.equal(ctf.game_data[game_id].origin.latitude, ctf.game_data[game_id].blue_bounds.top_left.latitude, "Blue bounds are not drawn right");
    test.equal(ctf.game_data[game_id].blue_bounds.top_left.longitude, ctf.game_data[game_id].red_bounds.top_left.longitude, "Top-left longitude does not match");
    test.equal(ctf.game_data[game_id].blue_bounds.bottom_right.longitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude, "Bottom-right longitude does not match");
    
    // Join game
    test.ok(controller.join_game(game_id, user1.id, user1), "Could not join game");
    test.ok(controller.join_game(game_id, user2.id, user2), "Could not join game");
    test.ok(controller.join_game(game_id, user3.id, user3), "Could not join game");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user1.id].observer_mode, "No observer mode");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user1.id].team, "No team");
    
    // Update location
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user1.id].observer_mode, "No observer mode");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user1.id].team, "No team");
    
    // Get location
    test.ok(controller.get_location(game_id));
    
    // Pass messages
    var message_status = controller.send_message(game_id, user1.id, user2.id, "I hope you lose.");
    test.strictEqual(null, message_status, "Message sent to opposite team:" + message_status);
    var message_status = controller.send_message(game_id, user1.id, user3.id, "This is my favoritest feature!");
    test.strictEqual(null, message_status, "Could not send String message:" + message_status);
    var complex_object = {
        user_id: 34578975,
        waypoints: {
            0: {
                latitude: 24.347467,
                longitude: -84.34643
            },
            0: {
                latitude: 24.356767,
                longitude: -84.347653
            },
            0: {
                latitude: 24.348567,
                longitude: -84.3967543
            }
        }
    };
    var message_status = controller.send_message(game_id, user3.id, user1.id, complex_object);
    test.strictEqual(null, message_status, "Could not send Object message:" + message_status);
    
    // Leave the game
    test.ok(controller.leave_game(game_id, user1.id), "Could not leave game");
    
    test.done();
};

exports.test_flag_race_condition = function(test) {
    var game_id = "test-game-workflow";
    
    // Create game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
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
    test.equal(0, ctf.game_data[game_id].players[user1.id].tags, "User1 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user2.id].tags, "User2 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user3.id].tags, "User3 has a tag");
    test.equal(0, ctf.game_data[game_id].players[user1.id].captures, "User1 has a capture");
    test.equal(0, ctf.game_data[game_id].players[user2.id].captures, "User2 has a capture");
    test.equal(0, ctf.game_data[game_id].players[user3.id].captures, "User3 has a capture");
    
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
    
    // Check captures
    test.equal(1, ctf.game_data[game_id].players[user1.id].captures, "User1 doesn't have a capture");
    test.equal(0, ctf.game_data[game_id].players[user2.id].captures, "User1 has a capture");
    test.equal(0, ctf.game_data[game_id].players[user3.id].captures, "User1 has a capture");
    
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
    
    // Check captures
    test.equal(1, ctf.game_data[game_id].players[user1.id].captures, "User1 doesn't have a capture");
    test.equal(0, ctf.game_data[game_id].players[user2.id].captures, "User1 has a capture");
    test.equal(1, ctf.game_data[game_id].players[user3.id].captures, "User1 has a capture");
    
    // Test that flag is not captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The user doesn't have the flag");
    test.done();    
};

/**

    //exports.test_move_flag = function(test) {
    //var game_id = "test-move-flag";
    //var user1 = {
    //        id: "Mike the Meek",
    //        latitude: 29.034681,
    //        longitude: -81.303774     
    //};
    //var user2 = {
    //        id: "Matt the Marvelous",
    //        latitude: 29.034681,
    //        longitude: -81.303774     
    //};
	
    // Create Game
    //test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
	//test.strictEqual(null, controller.move_flag(game_id, user_id, team, latitude, longitude), "Could not update flag location");

	
	// Creator Moves Flag
	//test.ok(controller.move_flag(game_id, user1.id, team, latitude, longitude), "Player 1 could not move flag");

	// Creator move flag while in observer mode
	//test.strictEqual(false, controller.move_flag(game_id, user1.id.observer_mode, team, latitude, longitude), "Player 1 could not move flag while in observer mode");

	
    //  Non-Creator Moves Flag
	//test.ok(controller.move_flag(game_id, user2.id, team, latitude, longitude), "Player 2 could not move flag");

	// Creator moves red flag
	//red_flag.latitude = ctf.game_data[game_id].red_flag.latitude + TWENTY_FEET;
    //red_flag.longitude = ctf.game_data[game_id].red_flag.longitude;
    //test.ok(ctf.game_data[game_id].players[user1.id].move_flag.red_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.red_flag.longitude, 'Creator not move red flag');	
    
	// Creator moves blue flag
	//blue_flag.latitude = ctf.game_data[game_id].blue_flag.latitude + TWENTY_FEET;
    //blue_flag.longitude = ctf.game_data[game_id].blue_flag.longitude;
    //test.ok(ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.longitude, 'Creator not move blue flag');	
    
	// Creator moves red and blue flag
	//red_flag.latitude = ctf.game_data[game_id].red_flag.latitude + TWENTY_FEET;
    //red_flag.longitude = ctf.game_data[game_id].red_flag.longitude;
	
	//blue_flag.latitude = ctf.game_data[game_id].blue_flag.latitude + TWENTY_FEET;
    //blue_flag.longitude = ctf.game_data[game_id].blue_flag.longitude;
	
    //test.ok(ctf.game_data[game_id].players[user1.id].move_flag.red_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.red_flag.longitude,
    //ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.longitude, 'Creator could not move both red and blue flags');	

	// Creator tries to move red and blue flag out of territory 
    //latitude = ctf.game_data[game_id][territory].top_left.latitude + TWENTY_FEET;
	//longitude = ctf.game_data[game_id][territory].top_left.longitude + TWENTY_FEET;

	//test.ok(ctf.game_data[game_id].players[user1.id].move_flag.red_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.red_flag.longitude, 'The red flag is in bounds; can't move flag outside bounds');	
    //test.ok(ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.longitude, 'The blue flag is in bounds; can't move flag outside bounds');	


	// Creator tries to move red flag into blue territory 
    //latitude = ctf.game_data[game_id][territory].blue_flag.top_left.latitude;
	//longitude = ctf.game_data[game_id][territory].blue_flag.top_left.longitude;
	
	//test.ok(ctf.game_data[game_id].players[user1.id].move_flag.red_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.red_flag.longitude, 'The red flag can't go in blue zone');	
   
	// Creator tries to move blue flag into red territory 
    //latitude = ctf.game_data[game_id][territory].red_flag.top_left.latitude;
	//longitude = ctf.game_data[game_id][territory].red_flag.top_left.longitude;
	
    //test.ok(ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.latitude, ctf.game_data[game_id].players[user1.id].move_flag.blue_flag.longitude, 'The blue flag can't go in red zone');	


*/
	
	
	
	
    //Strict flag testing (try to rapidly switch locations and see if it messes with game)
    //Try to move a flag into the current bounds created
    // Test how far they can move the flag
    //See what happens if you move a flag ontop of a player or opposite flag area
    //Test to see if anything weird happens in observer mode with a flag
    //Test moving flag out of bounds but close enough that a player can grab it  
    // More tests to see if someone has flag, 
    //captured it, 
    //or if more flags have been implemented

    //Join Game
 //test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
 
    //More strict testing to search for cheating, and to see if the other flag moves accordingly
    //Try to move a flag into the current bounds created
    //Test how far they can move the flag
    //See what happens if you move a flag ontop of a player or opposite flag area
    //Test to see if anything weird happens in observer mode
    //Test moving flag out of bounds but close enough that a player can grab it

    //Creator leaves game
    //test.ok(controller.leave_game(game_id, user1_id), "Could not leave game");
     //controller.move_flag(game_id, user_id, team, latitude, longitude);
  //  test.done();    
//};
