global.ctf = {};
ctf.game_data = {};
var controller = require("../backend/controller.js");

exports.test_game_workflow = function(test) {
    var game_id = "location_test";
    var user = {
        latitude: 29.034681,
        longitude: -81.303774     
    };
    
    // Create game
    controller.create_game(game_id, user.latitude, user.longitude);
    
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

    test.equal(null, ctf.game_data[game_id].players, "There are players");

    // Make sure there are no negative players
    //ctf.game_data[game_id].red -= 1;
    //ctf.game_data[game_id].blue -= 1;

   // test.equal(0, ctf.game_data[game_id].red, "Red team does not have -1 people!");
   // test.equal(0, ctf.game_data[game_id].blue, "Blue team does not have -1 people!")

   test.done();
};
