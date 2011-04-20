global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");
var TWENTY_FEET = 0.000001;

logic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();

algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

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
            id: "Laura the amazing",
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
    
    // Ensure everyone is on the right team
    test.equal("red", ctf.game_data[game_id].players[user1.id].team, "Not on red team");
    test.equal("blue", ctf.game_data[game_id].players[user2.id].team, "Not on blue team");
    test.equal("red", ctf.game_data[game_id].players[user3.id].team, "Not on red team");
    
    // Update location
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not update location");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user1.id].observer_mode, "No observer mode");
    test.notStrictEqual(undefined, ctf.game_data[game_id].players[user1.id].team, "No team");
    
    // Get location
    test.ok(controller.get_location(game_id));
    
    // Pass messages
    var message_status = controller.send_message(game_id, user1.id, user2.id, "I hope you lose.");
    test.notStrictEqual(null, message_status, "Message sent to opposite team:" + message_status);
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
            id: "Laura the amazing",
            latitude: 29.034681,
            longitude: -81.303774     
    };
    
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

exports.test_game_disconnect = function(test) {
    var game_id = "test_game_disconnect";
    var user1 = {
            id: "Bob the tester",
            latitude: 29.034681,
            longitude: -81.303774     
    };
    
    // Create game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Test preconditions
    test.equal("red", ctf.game_data[game_id].players[user1.id].team, "User isn't on red team");
    test.strictEqual(false, ctf.game_data[game_id].players[user1.id].observer_mode, "User is in observer_mode");
    
    // Move player over flag
    user1.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user1.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user1.id, user1), "Could not move player over flag");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Check that flag is captured
    test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "Blue flag is not captured");
    
    // Disconnect
    test.ok(controller.leave_game(game_id, user1.id), "Could not leave game");
    
    // Run business logic
    logic.run(ctf.game_data[game_id]);
    
    // Check that flag is captured
    test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "Blue flag is captured");
    
    test.done();
};

exports.test_move_flag = function(test) {
    var game_id = "test-move-flag";
    var user1 = {
            id: "Mike the Meek",
            latitude: 29.034681,
            longitude: -81.303774     
    };
    var user2 = {
            id: "Matt the Marvelous",
            latitude: 29.034681,
            longitude: -81.303774     
    };
	
    // Create Game
    test.ok(controller.create_game(game_id, user1.id, user1.latitude, user1.longitude), "Could not create game");
    test.ok(controller.join_game(game_id, user1.id, user1), "user1 could not join game");
    test.ok(controller.join_game(game_id, user2.id, user1), "user2 could not join game");
    
    var blue_flag = ctf.game_data[game_id].blue_flag;
    var red_flag = ctf.game_data[game_id].red_flag;
    var original_blue_flag = {
        latitude: ctf.game_data[game_id].blue_flag.latitude,
        longitude: ctf.game_data[game_id].blue_flag.longitude
    };
    var original_red_flag = {
        latitude: ctf.game_data[game_id].red_flag.latitude,
        longitude: ctf.game_data[game_id].red_flag.longitude
    };
	
	// Creator Moves Flag
	test.strictEqual(null, controller.move_flag(game_id, user1.id, "red", red_flag.latitude - TWENTY_FEET, red_flag.longitude), "Player 1 could not move flag");

	// Creator move flag while in observer mode
	ctf.game_data[game_id].players[user1.id].observer_mode = true;
	test.strictEqual(null, controller.move_flag(game_id, user1.id, "red", red_flag.latitude + TWENTY_FEET, red_flag.longitude), "Player 1 could not move flag while in observer mode");
	ctf.game_data[game_id].players[user1.id].observer_mode = false;
	
    // Non-Creator Moves Flag
	test.notStrictEqual(null, controller.move_flag(game_id, user2.id, "red", red_flag.latitude, red_flag.longitude), "Player 2 could move flag");

	// Creator moves blue flag
    test.strictEqual(null, controller.move_flag(game_id, user1.id, "blue", blue_flag.latitude + TWENTY_FEET, blue_flag.longitude), 'Creator not move blue flag');	

	// Creator tries to move red and blue flag out of territory 
    blue_flag.latitude = (blue_flag.latitude + 180) % 180;
    blue_flag.longitude = (blue_flag.longitude + 180) % 180;
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", blue_flag.latitude, blue_flag.longitude), "Player 1 could move flag OOB");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "blue", blue_flag.latitude, blue_flag.longitude), "Player 1 could move flag OOB");

	// Creator tries to move red flag into blue territory and vice versa
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", original_blue_flag.latitude, original_blue_flag.longitude), "Player 1 could move red flag to blue territory");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "blue", original_red_flag.latitude, original_red_flag.longitude), "Player 1 could move blue flag to red territory");
    
    // Move to original locations
    test.strictEqual(null, controller.move_flag(game_id, user1.id, "blue", original_blue_flag.latitude, original_blue_flag.longitude), "Player 1 could move red flag to red territory");
    test.strictEqual(null, controller.move_flag(game_id, user1.id, "red", original_red_flag.latitude, original_red_flag.longitude), "Player 1 could move blue flag to blue territory");

    // Test bad coordinates
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", 6578362347875, 7864578647547), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", -6578362347875, -7864578647547), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", "potato", "celery"), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", "potato", 50), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", 50, "celery"), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", -180.00000001, 0), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", 180.00000001, 0), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", 0, -180.00000001), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", 0, 180.00000001), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", NaN, 0), "Bad coordinate was accepted");
    test.notStrictEqual(null, controller.move_flag(game_id, user1.id, "red", 0, NaN), "Bad coordinate was accepted");
    
    test.done();    
};

exports.test_player_sorting = function(test) {
    var game_id = "test_player_sorting";
    
    // Set up players, giving them a random amount of tags and captures
    for (var i = 0; i < 100; i++) {
        // Spec out a test player
        var user = {
            id: "player_" + i,
            latitude: 27.0 + Math.random(),
            longitude: -84 + Math.random()
        };
        
        if (i === 0) {
            // Set up game
            test.ok(controller.create_game(game_id, user.id, 
                    user.latitude, user.longitude), "Could not create game");
        }
        
        // Add them to the game
        test.ok(controller.join_game(game_id, user.id, user), 
                "user " + i + " could not join game");
        
        // Give them a random number of tags and captures
        ctf.game_data[game_id].players[user.id].tags 
                = Math.floor(Math.random() * 20);
        ctf.game_data[game_id].players[user.id].captures 
                = Math.floor(Math.random() * 20);
    }
    
    // Fetch players
    var players = controller.get_location(game_id);
    test.ok(players, "No players were fetched");
    
    // Test sorting
    var previous_captures = Number.MAX_VALUE;
    var previous_tags = Number.MAX_VALUE;
    for (player in players) {
        if (players.hasOwnProperty(player)) {
            var new_captures = parseFloat(players[player].captures);
            var new_tags = parseFloat(players[player].tags);
            
            // Compare captures
            test.ok(new_captures <= previous_captures, 
                    "Players were not properly ordered by captures - " + 
                    new_captures + " > " + previous_captures);
            
            // Compare tags if captures are equal
            if (new_captures === previous_captures) {
                test.ok(new_tags <= previous_tags, 
                        "Players were not properly ordered by tags - " + 
                        new_tags + " > " + previous_tags);
            }
            
            // Assign tags and captures for next comparison
            previous_captures = new_captures;
            previous_tags = new_tags;
        }
    }
    
    test.done();
};