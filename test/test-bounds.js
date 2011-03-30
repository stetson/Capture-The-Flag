/**
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

logic_class = require("../modules/build/default/Logic.node");
var logic = new logic_class.Logic();

global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

var TWENTY_FEET = 0.000001;
var HALF_FIELD = 0.25;

// Test data
var user_id = "Bob the tester";
var game_id = "test_game";
var user = {
    latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

exports.test__generated_bounds = function(test) {
    // Create game (see test-game-workflow.js)
    controller.create_game(game_id, user.latitude, user.longitude);
    var game = ctf.game_data[game_id];
    
    // The different boundaries to test against
    var boundaries = { "red": 0, "blue": 1, "field": 2 };

    // Define some points to test
    point_inside_red = algorithms.add_miles_to_coordinate(user.latitude, user.longitude, HALF_FIELD, 0);
    point_inside_blue = algorithms.add_miles_to_coordinate(user.latitude, user.longitude, HALF_FIELD, 180);

    // Generate points around where bounds are using http://www.movable-type.co.uk/scripts/latlong.html
    // Do *NOT* use the Algorithms class to generate these points
    var points_to_test = [
        // Test mid-field boundary line (Points right on the line should be in red territory)
        { latitude: user.latitude, longitude: game.red_bounds.bottom_right.longitude, boundary: boundaries.red, expected_result: true },
        { latitude: user.latitude, longitude: game.red_bounds.top_left.longitude, boundary: boundaries.red, expected_result: true },
        { latitude: user.latitude, longitude: game.blue_bounds.bottom_right.longitude, boundary: boundaries.blue, expected_result: false },
        { latitude: user.latitude, longitude: game.blue_bounds.top_left.longitude, boundary: boundaries.blue, expected_result: false },
        
        // Test just a hair to the South (Should be in blue territory)
        { latitude: user.latitude - TWENTY_FEET, longitude: game.blue_bounds.bottom_right.longitude, boundary: boundaries.blue, expected_result: true },
        { latitude: user.latitude - TWENTY_FEET, longitude: game.blue_bounds.top_left.longitude, boundary: boundaries.blue, expected_result: true },
        
        // Test red corners
        { latitude: game.red_bounds.top_left.latitude, longitude: game.red_bounds.top_left.longitude, boundary: boundaries.red, expected_result: true },
        { latitude: game.red_bounds.bottom_right.latitude, longitude: game.red_bounds.bottom_right.longitude, boundary: boundaries.red, expected_result: true },
        { latitude: game.red_bounds.bottom_right.latitude, longitude: game.red_bounds.top_left.longitude, boundary: boundaries.red, expected_result: true },
        { latitude: game.red_bounds.top_left.latitude, longitude: game.red_bounds.bottom_right.longitude, boundary: boundaries.red, expected_result: true },
        
        // Test blue corners
        { latitude: game.blue_bounds.top_left.latitude - TWENTY_FEET, longitude: game.blue_bounds.top_left.longitude, boundary: boundaries.blue, expected_result: true },
        { latitude: game.blue_bounds.bottom_right.latitude, longitude: game.blue_bounds.bottom_right.longitude, boundary: boundaries.blue, expected_result: true },
        { latitude: game.blue_bounds.bottom_right.latitude, longitude: game.blue_bounds.top_left.longitude, boundary: boundaries.blue, expected_result: true },
        { latitude: game.blue_bounds.top_left.latitude - TWENTY_FEET, longitude: game.blue_bounds.bottom_right.longitude, boundary: boundaries.blue, expected_result: true },
        //Test red inside 
        {latitude: point_inside_red.latitude, longitude: point_inside_red.longitude, boundary: boundaries.field, expected_result: true },
        //Test blue inside
        {latitude: point_inside_blue.latitude, longitude: point_inside_blue.longitude, boundary: boundaries.field, expected_result: true },
        
        //Test points close to line
        {latitude: game.blue_bounds.top_left.latitude, longitude: game.red_bounds.top_left.longitude + TWENTY_FEET, boundary: boundaries.field, expected_result: true },

        {latitude: game.blue_bounds.top_left.latitude, longitude: game.red_bounds.top_left.longitude - TWENTY_FEET, boundary: boundaries.field, expected_result: false }
    ];
    
    // Test to see if points are in the rectangle, and match against expected result:
    // (see test-algorithms.js for examples of usage of in_rectangle)
    for (var i = 0; i < points_to_test.length; i++) {
        switch (points_to_test[i].boundary) {
        case boundaries.red:
            // Test to see if the point is in the red territory
            test.strictEqual(points_to_test[i].expected_result, algorithms.in_rectangle(points_to_test[i].latitude, points_to_test[i].longitude,
                    game.red_bounds.top_left.latitude, game.red_bounds.top_left.longitude,
                    game.red_bounds.bottom_right.latitude, game.red_bounds.bottom_right.longitude));
            break;
        case boundaries.blue:
            // Test to see if the point is in the blue territory
            test.strictEqual(points_to_test[i].expected_result, algorithms.in_rectangle(points_to_test[i].latitude, points_to_test[i].longitude,
                    game.blue_bounds.top_left.latitude, game.blue_bounds.top_left.longitude,
                    game.blue_bounds.bottom_right.latitude, game.blue_bounds.bottom_right.longitude));
            break;
        case boundaries.field:
            // Test to see if the point is on the field
            test.strictEqual(points_to_test[i].expected_result, algorithms.in_rectangle(points_to_test[i].latitude, points_to_test[i].longitude,
                    game.red_bounds.top_left.latitude, game.red_bounds.top_left.longitude,
                    game.blue_bounds.bottom_right.latitude, game.blue_bounds.bottom_right.longitude));
            break;
        }        
    }

    test.done();
};

exports.test_bounds = function(test) {
    // Create game
controller.create_game(game_id, user.latitude, user.longitude);
    var game = ctf.game_data[game_id];

    // Join game
test.ok(controller.join_game(game_id, user_id, user), "Could not join game");

    // Start in territory
ctf.game_data[game_id].players[user_id].latitude += .001;
    test.strictEqual(true, algorithms.in_rectangle(ctf.game_data[game_id].players[user_id].latitude, ctf.game_data[game_id].players[user_id].longitude,
            ctf.game_data[game_id].red_bounds.top_left.latitude, ctf.game_data[game_id].red_bounds.top_left.longitude,  
            ctf.game_data[game_id].red_bounds.bottom_right.latitude, ctf.game_data[game_id].red_bounds.bottom_right.longitude), "The user is not starting the test in their territory");

    // Run logic
    logic.run(ctf.game_data[game_id]);

    // has_flag is false
test.strictEqual(false, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");

    // blue_flag_captured is false
test.strictEqual(false, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");

    // observer_mode is false
test.strictEqual(false, ctf.game_data[game_id].players[user_id].observer_mode, "User is out of bounds, and therefore should be in observer mode");

    // Move over other team's flag
user.latitude = ctf.game_data[game_id].blue_flag.latitude;
    user.longitude = ctf.game_data[game_id].blue_flag.longitude;
    test.strictEqual(null, controller.update_location(game_id, user_id, user), "Could not move player over flag");

    // Run logic
    logic.run(ctf.game_data[game_id]);
    // has_flag is true
test.strictEqual(true, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");
    // blue_flag_captured is true
test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");
    // observer_mode is false
test.strictEqual(false, ctf.game_data[game_id].players[user_id].observer_mode, "User is out of bounds, and therefore should be in observer mode");

    // move out of bounds
user.latitude = 31.503629; // China :-)
    user.longitude = 121.289063;
    test.strictEqual(null, controller.update_location(game_id, user_id, user), "Could not move out of bounds");

    // Run logic
    logic.run(ctf.game_data[game_id]);
    // observer_mode is true
test.strictEqual(true, ctf.game_data[game_id].players[user_id].observer_mode, "User is out of bounds, and therefore should be in observer mode");

    // has_flag is false
test.strictEqual(true, ctf.game_data[game_id].players[user_id].has_flag, "The user has the flag");

    // blue_flag_captured is false
test.strictEqual(true, ctf.game_data[game_id].blue_flag_captured, "The blue flag should not be captured");
test.done();
};
