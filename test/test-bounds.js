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

/**
 * Test the automatically generated bounds to double check
 * that they are drawn where expected
 * 
 * @name test_generated_bounds
 * @memberOf tests
 */
exports.test_generated_bounds = function(test) {
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