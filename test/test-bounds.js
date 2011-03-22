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
    // TODO - create game (see test-game-workflow.js)
    // game = controller.create_game(...
    // TODO - generate points around where bounds are using http://www.movable-type.co.uk/scripts/latlong.html
    // TODO - test to see if in_rectangle returns the results we expect (see test-algorithms.js)
    
    // You'll be doing this a lot:
    // point_from_site = {
    //     latitude: ...,
    //     longitude: ...
    // }

    // For points that should be in the rectangle:
    // test.ok(algorithms.in_rectangle(ctf.game_data[game_id].red_bounds.latitude, ...
    
    // For points that should NOT be in the rectangle:
    // test.ok(! algorithms.in_rectangle(ctf.game_data[game_id].red_bounds.latitude, ...
    
    // TODO - test corners
    // TODO - test mid-field boundary line
    // TODO - test points known to be inside
    // TODO - test points known to be outside
    // TODO - test points very close to where the line should be on either side
    
    test.done();
};