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
controller.create_game(game_id, user.latitude, user.longitude)
    // game = 
game = controller.create_game(game_id, user.latitude, user.longitude)
    // TODO - generate points around where bounds are using http://www.movable-type.co.uk/scripts/latlong.html
    // TODO - test to see if in_rectangle returns the results we expect (see test-algorithms.js)
    
    // You'll be doing this a lot:
    // point_from_site = {
    //     latitude: 29.034681
    //     longitude: -81.303774
    // }


var point_top_left = algorithms.add_miles_to_coordinate(user.latitude, user.longitude, Math.sqrt(0.5), 315);

var point_bottom_right = algorithms.add_miles_to_coordinate(user.latitude, user.longitude, 0.5, 90);

var point_top_right = algorithms.add_miles_to_coordinate(point_bottom_right.latitude, point_bottom_right.longitude, 0.5, 0);

var distance = algorithms.distance_in_miles( point_top_right.latitude, point_top_right.longitude,point_bottom_right.latitude,point_bottom_right.longitude);
var distance1 = algorithms.distance_in_miles( point_top_left.latitude, point_top_left.longitude,point_top_right.latitude,point_top_right.longitude);


var bool = (distance < 0.51);
var bool1 = (distance1 < 1.0);

test.strictEqual(true, bool,"distance messed up");
test.strictEqual(true, bool1,"distance messed up");

//Testing distance
console.log(" distance\n -> " + distance1+ " miles");

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
