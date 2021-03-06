global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

exports.test_team_allocation = function(test) {
    var game_id = "location_test";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    // Create game
    controller.create_game(game_id, user.id, user.latitude, user.longitude);
    
    // Have 10 people join game
    for (i = 0; i < 10; i++) {
        controller.join_game(game_id, "Player " + i, user);
    }
    
    // Make sure it's 5 on 5
    test.equal(5, ctf.game_data[game_id].red, "Red team does not have 5 people!");
    test.equal(5, ctf.game_data[game_id].blue, "Blue team does not have 5 people!");
    
    // Have one more person join
    controller.join_game(game_id, "Player 10", user);
    
    // Make sure it's 6 on 5
    test.equal(6, ctf.game_data[game_id].red, "Red team does not have 6 people!");
    test.equal(5, ctf.game_data[game_id].blue, "Blue team does not have 5 people!");
    
    // Remove one of the blue players
    delete ctf.game_data[game_id].players["Player 1"];
    ctf.game_data[game_id].blue -= 1;
    
    // Have one more person join
    controller.join_game(game_id, "Player 10", user);
    
    // Make sure it's still 6 on 5
    test.equal(6, ctf.game_data[game_id].red, "Red team does not have 6 people!");
    test.equal(5, ctf.game_data[game_id].blue, "Blue team does not have 5 people!");
    
    // Remove remaining players
    delete ctf.game_data[game_id].players["Player 0"];
    ctf.game_data[game_id].red -= 1;
    delete ctf.game_data[game_id].players["Player 2"];
    ctf.game_data[game_id].red -= 1;
    delete ctf.game_data[game_id].players["Player 3"];
    ctf.game_data[game_id].blue -= 1;
    delete ctf.game_data[game_id].players["Player 4"];
    ctf.game_data[game_id].red -= 1;
    delete ctf.game_data[game_id].players["Player 5"];
    ctf.game_data[game_id].blue -= 1;
    delete ctf.game_data[game_id].players["Player 6"];
    ctf.game_data[game_id].red -= 1;
    delete ctf.game_data[game_id].players["Player 7"];
    ctf.game_data[game_id].blue -= 1;
    delete ctf.game_data[game_id].players["Player 8"];
    ctf.game_data[game_id].red -= 1;
    delete ctf.game_data[game_id].players["Player 9"];
    ctf.game_data[game_id].blue -= 1;
    delete ctf.game_data[game_id].players["Player 10"]; 
    ctf.game_data[game_id].red -= 1;
    delete ctf.game_data[game_id].players["Player 10"]; 
    ctf.game_data[game_id].blue -= 1;

    // Make sure the game is now 0 on 0
    test.equal(0, ctf.game_data[game_id].red, "Red team does not have 0 people!");
    test.equal(0, ctf.game_data[game_id].blue, "Blue team does not have 0 people!");

    // Make sure there are no players
    var player_count = 0;
    for (k in ctf.game_data[game_id].players) {
        if (ctf.game_data[game_id].hasOwnProperty(k)) { 
            player_count++;
        }
    }
    test.equal(0, player_count, "There are players");

   	test.done();
};

exports.test_team_switching = function(test) {
    var game_id = "team_switching_test";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    // Create game
    controller.create_game(game_id, user.id, user.latitude, user.longitude);
    
    // Have some people join
    for (var i = 0; i < 10; i++) {
        controller.join_game(game_id, "player_" + i, {
            latitude: user.latitude,
            longitude: user.longitude
        });
    }
    
    // Test that player 0 is red
    test.equal("red", ctf.game_data[game_id].players["player_0"].team, "player isn't on red team");
    
    // Test that there are equal teams
    test.equal(5, ctf.game_data[game_id].red, "Red team doesn't have 5 people");
    test.equal(5, ctf.game_data[game_id].blue, "Blue team doesn't have 5 people");
    
    // Have even people leave
    for (i = 0; i < 5; i++) {
        var player_id = "player_" + ((i * 2) + 1);
        ctf.game_data[game_id][
            ctf.game_data[game_id].players[player_id].team
        ] -= 1;
        delete ctf.game_data[game_id].players[player_id];
    }
    
    // Test that player 0 is red
    test.equal("red", ctf.game_data[game_id].players["player_0"].team, "player isn't on red team");
    
    // Test that it's 5-0
    test.equal(5, ctf.game_data[game_id].red, "Red team doesn't have 5 people");
    test.equal(0, ctf.game_data[game_id].blue, "Blue team doesn't have 0 people");
    
    // Have Bob join the game
    controller.join_game(game_id, "Bob" + i, user);
    
    // Test that player 0 is red
    test.equal("red", ctf.game_data[game_id].players["player_0"].team, "player isn't on red team");
    
    // Test that it's 5-1
    test.equal(5, ctf.game_data[game_id].red, "Red team doesn't have 5 people");
    test.equal(1, ctf.game_data[game_id].blue, "Blue team doesn't have 1 people");
    
    test.done();
};
