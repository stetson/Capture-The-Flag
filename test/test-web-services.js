var test_port = 9999;
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
    { method: "POST", url: "/game", postData: "game_id=test_game&latitude=27&longitude=-83", statusCode: 200 },
    
    // Make sure we can't duplicate a game
    { method: "POST", url: "/game", postData: "game_id=test_game&latitude=27&longitude=-83", statusCode: 409 },
    
    // Make sure crappy data won't corrupt game object
    { method: "POST", url: "/game", postData: "game_id=test_game2", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&latitude=27", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&longitude=-83", statusCode: 400 },
    { method: "POST", url: "/game", postData: "latitude=27&longitude=-83", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&potato=nomnom", statusCode: 400 },
    { method: "POST", url: "/game", postData: "game_id=test_game2&latitude=27&longitude=-83", statusCode: 200 },
];

var run_test = function(test, test_case) {
    // If we reached the end of the case, then quit
    if (test_case >= tests.length) {
        clearTimeout(timer);
        server.kill('SIGTERM');
        test.done();
        return;
    }
    
    // Log request
    console.log(tests[test_case].method + " " + tests[test_case].url);
    
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
            console.log("  HTTP " + tests[test_case].statusCode);
            
            // Check the response for the given status code
            if (tests[test_case].statusCode !== undefined) {
                test.equal(tests[test_case].statusCode, res.statusCode, "Status code for " + tests[test_case].url + " was not what was expected");
            }
            
            // Check the response for the given data
            res.on('data', function(chunk) {
                if (tests[test_case].data !== undefined) {
                    test.notEqual(-1, chunk.toString().indexOf(tests[test_case].data), "Test data (" + tests[test_case].data + " was not found in response (" + chunk.toString().substring(0,20) + "...)");
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
        // Run the first test
        test.notEqual(-1, data.toString('utf-8').indexOf(test_port), "Server did not start on the expected port: " + data.toString('utf-8'));
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
        server.kill('SIGTERM');
        test.ok(false, "Server hanging. Check your firewall settings.");
        test.done();
    }, 30000);
};