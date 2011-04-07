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
	id: "Allen the Lackey",
	latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

var user5 = {
	id: "Sean the Artful",
	latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

var user6 = {
	id: "Mark the Puppeteer",
	latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

var user7 = {
	id: "Cap the Flag",
	latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

var user8 = {
	id: "Mike the Mechanic",
	latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

var user9 = {
	id: "Matt the Technician",
	latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

var user10 = {
	id: "Dan the Wise",
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

exports.test_multi_players = function(test) {
	 var game_id = "test-game-workflow";
    
    // Create game with ten people
    // FIXME - BROKEN!!!!!!!!!!!!!
	 /*
	test.ok(controller.create_game(game_id, user1.latitude, user1.longitude), "Could not create game");
	test.ok(controller.join_game(game_id, user.id, user1), "user1 could not join game");
	test.ok(controller.join_game(game_id, user.id, user2), "user2 could not join game");
	test.ok(controller.join_game(game_id, user.id, user3), "user3 could not join game");
	test.ok(controller.join_game(game_id, user.id, user4), "user4 could not join game");
	test.ok(controller.join_game(game_id, user.id, user5), "user5 could not join game");
	test.ok(controller.join_game(game_id, user.id, user6), "user6 could not join game");
	test.ok(controller.join_game(game_id, user.id, user7), "user7 could not join game");
	test.ok(controller.join_game(game_id, user.id, user8), "user8 could not join game");
	test.ok(controller.join_game(game_id, user.id, user9), "user9 could not join game");
	test.ok(controller.join_game(game_id, user.id, user10), "user10 could not join game");
	*/


	test.done();
};
