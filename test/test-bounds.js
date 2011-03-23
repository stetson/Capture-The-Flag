/**
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

// Test data
var user_id = "Bob the tester";
var game_id = "test_game";
var user = {
    latitude: 29.034681,
    longitude: -81.303774
};

exports.test_bounds = function(test) {
    // Create game (see test-game-workflow.js)
    controller.create_game(game_id, user.latitude, user.longitude);
    var game = ctf.game_data[game_id];
    
    // The different boundaries to test against
    var boundaries = { "red": 0, "blue": 1, "field": 2 };

    // Generate points around where bounds are using http://www.movable-type.co.uk/scripts/latlong.html
    // Do *NOT* use the Algorithms class to generate these points
    var points_to_test = [
        // Test mid-field boundary line
        { latitude: user.latitude, longitude: game.red_bounds.bottom_right.longitude, expected_result: true, boundary: boundaries.red },
        { latitude: user.latitude, longitude: game.red_bounds.top_left.longitude, expected_result: true, boundary: boundaries.red }
        
        // TODO - test corners
        // TODO - test points known to be inside
        // TODO - test points known to be outside
        // TODO - test points very close to where the line should be on either side
    ];
    
    // Test to see if points are in the rectangle, and match against expected result:
    // (see test-algorithms.js for examples of usage of in_rectangle)
    for (var i = 0; i < points_to_test.length; i++) {
        switch (points_to_test[i].boundary) {
        case boundaries.red:
            test.strictEqual(points_to_test[i].expected_result, algorithms.in_rectangle(points_to_test[i].latitude, points_to_test[i].longitude,
                    game.red_bounds.top_left.latitude, game.red_bounds.top_left.longitude,
                    game.red_bounds.bottom_right.latitude, game.red_bounds.bottom_right.longitude));
            break;
        case boundaries.blue:
            test.strictEqual(points_to_test[i].expected_result, algorithms.in_rectangle(points_to_test[i].latitude, points_to_test[i].longitude,
                    game.blue_bounds.top_left.latitude, game.blue_bounds.top_left.longitude,
                    game.blue_bounds.bottom_right.latitude, game.blue_bounds.bottom_right.longitude));
            break;
        case boundaries.field:
            test.strictEqual(points_to_test[i].expected_result, algorithms.in_rectangle(points_to_test[i].latitude, points_to_test[i].longitude,
                    game.red_bounds.top_left.latitude, game.red_bounds.top_left.longitude,
                    game.blue_bounds.bottom_right.latitude, game.blue_bounds.bottom_right.longitude));
            break;
        }        
    }

    test.done();
};
