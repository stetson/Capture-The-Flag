var test_port = 9090;
var http = require('http');
var spawn = require('child_process').spawn;
var timer, server;
var started = false;

/**
 * Unit test cases for web services
 * Format:
 * {
 *     method: {HTTP method},
 *     url: {url of service},
 *     statusCode: {expected status code (optional)},
 *     data: {data that should be contained in the response (optional)}
 * }
 */
var tests = [
    // Make sure the server is reachable
    { method: "GET", url: "/", statusCode: 200 },
    
    // Make sure people can't request games without a latitude and longitude
    { method: "GET", url: "/game", statusCode: 400 },
    
    // Make sure there are no games near China
    { method: "GET", url: "/game?latitude=31.428663&longitude=121.289063", statusCode: 200, data: "[]" },
    
    // Make sure crappy data doesn't break the game list
    { method: "GET", url: "/game?latitude=potato&longitude=window", statusCode: 200, data: "[]" },
    { method: "GET", url: "/game?latitude=potato", statusCode: 400, data: "error" },
    { method: "GET", url: "/game?longitude=window", statusCode: 400, data: "error" },
    { method: "GET", url: "/game?ax=grind", statusCode: 400, data: "error" },
    
    // Make sure we can create a game
    { method: "POST", url: "/game", postData: "game_id=test_game&user_id=Bob&latitude=27&longitude=-83", statusCode: 200 },
    
    // Make sure we can't duplicate a game
    { method: "POST", url: "/game", postData: "game_id=test_game&user_id=Bob&latitude=27&longitude=-83", statusCode: 409, data: "Game already exists" },
    
    // Make sure crappy data won't corrupt game object
    { method: "POST", url: "/game", postData: "game_id=test_game2&user_id=Bob", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&latitude=27&user_id=Bob", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&longitude=-83&user_id=Bob", statusCode: 400 },
    { method: "POST", url: "/game", postData: "latitude=27&longitude=-83&user_id=Bob", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&potato=nomnom&user_id=Bob", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&latitude=27&longitude=-83&user_id=Bob", statusCode: 200 },
    
    // Not implemented (returned as 404 for now. this is an express issue)
    { method: "PUT", url: "/game", statusCode: 404 },
    { method: "DELETE", url: "/game", statusCode: 404 },
    
    // Join the game
    { method: "POST", url: "/game/test_game", postData: "user_id=Bob&latitude=27&longitude=-83&accuracy=5", statusCode: 200, data: "red_flag" },
    { method: "POST", url: "/game/test_game", postData: "user_id=DarthVader&latitude=27&longitude=-83&accuracy=5", statusCode: 200 },
    { method: "POST", url: "/game/test_game", postData: "user_id=Frank&latitude=27&longitude=-83&accuracy=5", statusCode: 200 },
    
    // Make sure I can't join an imaginary game
    { method: "POST", url: "/game/fantasy", postData: "user_id=Bob", statusCode: 404, data: "error" },
    
    // Make sure I can't join the game with crap data
    { method: "POST", url: "/game/test_game", statusCode: 400, data: "required information" },
    { method: "POST", url: "/game/test_game", postData: "potato=red", statusCode: 400, data: "required information" },
    { method: "POST", url: "/game/test_game", postData: "latitude=27&longitude=-83", statusCode: 400, data: "required information" },
    
 	// Update the user's information
    { method: "POST", url: "/location", postData: "game_id=test_game&user_id=Bob&latitude=27&longitude=-83&accuracy=5", statusCode: 200, data: "Bob" },
    
    // Thou shalt only POST
    { method: "GET", url: "/location", statusCode: 404 },
    { method: "PUT", url: "/location", statusCode: 404 },
    { method: "DELETE", url: "/location", statusCode: 404 },
    
    // Make sure I can't update for a fake user
    { method: "POST", url: "/location", postData: "game_id=test_game&user_id=PeeWeeHerman&latitude=27&longitude=-83&accuracy=5", statusCode: 400, data: "Invalid user" },
    
    // Make sure user can't be updated with crap information
    { method: "POST", url: "/location", postData: "game_id=test_game&user_id=PeeWeeHerman&latitude=27&longitude=-83&accuracy=5", statusCode: 400, data: "Invalid user" },
    { method: "POST", url: "/location", postData: "game_id=test_game3&user_id=Bob&latitude=27&longitude=-83&accuracy=5", statusCode: 400, data: "Invalid game" },
    { method: "POST", url: "/location", postData: "game_id=test_game&user_id=PeeWeeHerman&latitude=somewhere&longitude=out_there", statusCode: 400, data: "Invalid data" },
    
    // Make sure fake people are gone
    { method: "DELETE", url: "/game/test_game/Unicorn", statusCode: 410},
    
    // Make sure missing information isn't accepted (results in 404 because no matching route is found)
    { method: "DELETE", url: "/game/test_game", statusCode: 404},
    
    // Make sure fake games are not found
    { method: "DELETE", url: "/game/fake_game/Bob", statusCode: 404},
    
    // Remove Bob from his game, and make sure he can't come back
    { method: "DELETE", url: "/game/test_game/Bob", statusCode: 200},
    { method: "DELETE", url: "/game/test_game/Bob", statusCode: 410},
    
    // Have Bob and Frank chat a bit
    //{ method: "POST", url: "/message", postData: "game_id=test_game&to_id=Bob&from_id=Frank&message=How%20are%20you!%3F", statusCode: 200, data: "OK" },
    //{ method: "POST", url: "/message", postData: "game_id=test_game&to_id=Frank&from_id=Bob&message=Good.%20And%20you%3F", statusCode: 200, data: "OK" },
    //{ method: "POST", url: "/message", postData: "game_id=test_game&to_id=Bob&from_id=Frank&message=Doing%20well.", statusCode: 200, data: "OK" },
    //{ method: "POST", url: "/message", postData: "game_id=test_game&to_id=Frank&from_id=Bob&message=awesome", statusCode: 200, data: "OK" },
    
    // If you can't say something nice, don't say nothin at all
    //{ method: "POST", url: "/message", postData: "game_id=test_game&from_id=Bob&message=awesome", statusCode: 400, data: "required information" },
    //{ method: "POST", url: "/message", postData: "game_id=fanstasy&to_id=Frank&from_id=Bob&message=awesome", statusCode: 400, data: "Game was not found" },
    //{ method: "POST", url: "/message", postData: "game_id=test_game&to_id=DarthVader&from_id=Bob&message=awesome", statusCode: 400, data: "same team" },
    //{ method: "POST", url: "/message", postData: "game_id=test_game&to_id=Frank&from_id=Bob&message=", statusCode: 400, data: "required information" },
];

var run_test = function(test, test_case) {
    // If we reached the end of the case, then quit
    if (test_case >= tests.length) {
        clearTimeout(timer);
        server.kill('SIGKILL');
        test.done();
        return;
    }
    
    // Log request
    // console.log(tests[test_case].method + " " + tests[test_case].url);
    
    // Request the given url and check the response
    try {
        var request = http.request({
            host: 'localhost',
            port: test_port,
            path: tests[test_case].url,
            method: tests[test_case].method,
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }, function(res) {
            // Log response
            // console.log("  HTTP " + tests[test_case].statusCode);
            
            // Check the response for the given status code
            if (tests[test_case].statusCode !== undefined) {
                test.equal(tests[test_case].statusCode, res.statusCode, "Status code for " + tests[test_case].url + " was not what was expected [Test " + test_case + "]");
            }
            
            // Check the response for the given data
            res.on('data', function(chunk) {
                if (tests[test_case].data !== undefined) {
                    test.notEqual(-1, chunk.toString().indexOf(tests[test_case].data), "Test data (" + tests[test_case].data + ") was not found in response (" + chunk.toString().substring(0,50) + "...) [Test " + test_case + "]");
                }
            });
            
            run_test(test, test_case + 1);
        });
        
        // Send POST data if applicable, and terminate request
        if (tests[test_case].postData !== undefined) {
            request.end(tests[test_case].postData + "\n");
        } else {
            request.end();
        }
    } catch (e) {
        test.ok(false, "Connection to server refused: " + e.message);
        run_test(test, test_case + 1);
    }
};

exports.test_web_services = function(test) {
    // Spawn server
    server = spawn("node", ["server.js", "" + test_port]);
    
    server.stdout.on('data', function(data) {
    	// Write the data to the terminal
    	console.log(data.toString());
    	
        // Run the first test
        setTimeout(function() {
            if (! started) {
                started = true;
                run_test(test, 0);
            }
        }, 50);
    });
    
    server.stderr.on('data', function(data) {
        console.log("error:");
        console.log(data.toString('utf-8'));
    });
    
    timer = setTimeout(function() {
        console.log("Tests timed out");
        server.kill('SIGKILL');
        test.ok(false, "Server hanging. Check your firewall settings.");
        test.done();
    }, 5000);
};