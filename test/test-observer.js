global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");
logic_class = require("../modules/build/default/Logic.node");

var logic = new logic_class.Logic();
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

var TWENTY_FEET = 0.000001;
var HALF_FIELD = 0.25;

// Test data
exports.test_observer = function(test) {
var user_id = "Bob the tester";
var game_id = "test_game";
var user = {
    latitude: 29.034681,    // 29°02′04.9″N
    longitude: -81.303774   // 81°18′13.6″W
};

// Create game
test.ok(controller.create_game(game_id, user.latitude, user.longitude), "Could not create game");
controller.create_game(game_id, user.latitude, user.longitude);
    var game = ctf.game_data[game_id];
    
// Join game
test.ok(controller.join_game(game_id, user_id, user), "Could not join game");
controller.join_game(game_id, user.latitude, user.longitude);

test.strictEqual(true, user.observer_mode);
logic.run(ctf.game_data[game_id]);


// The different boundaries to test against
    var boundaries = { "red": 0, "blue": 1, "field": 2 };
point_inside_red = algorithms.add_miles_to_coordinate(user.latitude, user.longitude, HALF_FIELD, 0);
point_inside_blue = algorithms.add_miles_to_coordinate(user.latitude, user.longitude, HALF_FIELD, 180);

//Move out of bounds
var point_to_test = [
{latitude: game.blue_bounds.top_left.latitude, longitude: game.red_bounds.top_left.longitude - TWENTY_FEET, boundary: boundaries.field, expected_result: false }
];

logic.run(ctf.game_data[game_id]);

test.done();
};
