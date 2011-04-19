/**
 * server.js
 * 
 * This is the main application class, and controls
 * daemonization, imports, and routing.
 * 
 * @author Allen Carroll
 */

//////////Imports

/**
 * The express framework and HTTP middleware
 */
var express = require("express");

/**
 * Filesystem object for file access
 */
var fs = require('fs');

////////// Global data

/**
 * Global object
 * 
 * @namespace ctf
 */
global.ctf = {};

/**
 * The global object used for storing application data
 * ..
 * <pre>
 * Example:                                             
 * {
 *     game_id: {
 *         // The point of origin of the game
 *         origin: {
 *             latitude: Number,
 *             longitude: Number
 *         },
 *         
 *         // The position of the red flag
 *         red_flag: {
 *             latitude: Number,
 *             longitude: Number,
 *             ...
 *         },
 *         
 *         // The position of the blue flag
 *         blue_flag: {
 *             latitude: Number,
 *             longitude: Number,
 *             ...
 *         },
 *         
 *         // The bounds of the red territory
 *         red_bounds: {
 *             top_left: {
 *                 latitude: Number,
 *                 longitude: Number,
 *                 ...
 *             },
 *             bottom_right: {
 *                 latitude: Number,
 *                 longitude: Number,
 *                 ...
 *             }
 *         },
 *         
 *         // The bounds of the blue territory
 *         blue_bounds: {
 *             top_left: {
 *                 latitude: Number,
 *                 longitude: Number,
 *                 ...
 *             },
 *             bottom_right: {
 *                 latitude: Number,
 *                 longitude: Number,
 *                 ...
 *             }
 *         },
 *         
 *         // The number of red players
 *         red: Number,
 *         
 *         // The number of blue players
 *         blue: Number,
 *         
 *         // The score for the red team
 *         red_score: Number,
 *         
 *         // The score for the blue team
 *         blue_score: Number,
 *         
 *         // Whether or not the red flag is currently captured
 *         red_flag_captured: Boolean,
 *         
 *         // Whether or not the blue flag is currently captured
 *         blue_flag_captured: Boolean,
 *         
 *         // The last time anyone in this game updated
 *         last_update: DateTime,
 *         
 *         // The size of the field
 *         field_size: Number,
 *         
 *         // The player objects
 *         players: {
 *         
 *             // A player object, keyed by user_id
 *             user_id: {
 *                 latitude: Number,
 *                 longitude: Number,v
 *                 accuracy: Number,
 *                 auth_token: String,
 *                 user_id: String,
 *                 name: String,
 *                 game_id: String,
 *                 last_update: DateTime,
 *                 team: String,
 *                 has_flag: Boolean,
 *                 tags: Number,
 *                 captures: Number,
 *                 messages: Array
 *             },
 *             ...
 *         }
 *     },
 *     ...
 * }
 * </pre>
 *
 * @name game_data
 * @memberOf global.ctf
 */
ctf.game_data = {};

/**
 * Constants for use in the program
 * 
 * @name constants
 * @memberOf global.ctf
 */
ctf.constants = {
    MINUTE: 60*1000,
    SECOND: 1000,
    DISABLE_USER_INTERVAL: 1, // Disable users which have not reported their location in this period of time (in minutes)
    PURGE_USER_INTERVAL: 5, // Purge users which have not reported their location in this period of time (in minutes)
    PURGE_GAMES_INTERVAL: 10, // Purge games which have not been updated in this period of time (in minutes)
    GAME_RADIUS: 5 // Fetch games within this many miles of the user 
};

/**
 * Utility functions for garbage collection
 * 
 * @namespace utils
 */
var utils = require("./backend/utils.js");

/**
 * The views which will handle incoming requests
 * and return the necessary JSON
 * 
 * @namespace views
 */
var views = require("./backend/views.js");

/**
 * Purge old users
 */
setInterval(utils.purge_players, ctf.constants.DISABLE_USER_INTERVAL * ctf.constants.MINUTE);

/**
 * Purge old games
 */
setInterval(utils.purge_games, ctf.constants.PURGE_GAMES_INTERVAL * ctf.constants.MINUTE);

/**
 * Periodically backup data
 */
setInterval(utils.backup_game_data, 10 * ctf.constants.SECOND);

////////// Routes

/** 
 * The server object which controls all routes<br />
 * These are the JSON endpoints for the entire application
 * 
 * @namespace http
 */
var http = express.createServer();
http.use(express.bodyParser());

/**
 * Static files for frontend <br />
 * <b>url: / *</b>
 * 
 * @memberOf http
 * @name frontend 
 * @param request
 **/
http.use(express.static('./frontend/'));

/**
 * Documentation <br />
 * <b>url: / *</b>
 * 
 * @memberOf http
 * @name docs 
 * @param request
 **/
http.use(express.static('./docs/'));

/**
 * Updates the user's location
 * <pre>
 * 
 * <b>url: /location</b>           
 * methods: GET, POST
 * ..              
 * 
 * Client data:                    
 *     accuracy: Number            
 *     auth_token: String
 *     game_id: String
 *     latitude: Number
 *     longitude: Number
 *     name: String
 *     user_id: String
 * 
 * Server data:                    
 *     [game object]
 * </pre>
 * 
 * @memberOf http
 * @name update_location
 * @link controller.update_location
 * @link ctf.game_data
 * @param request
 **/
http.post('/location', views.update_location);

/**
 * Send a message to another player
 * <pre>
 * 
 * <b>url: /message</b>           
 * methods: POST
 * ..              
 * 
 * Client data:                    
 *     game_id: {String} The id of the game
 *     to_id: {String} The id of the user receiving the message
 *     from_id: {String} The id of the user sending the message
 *     message: {Object} The message payload
 * 
 * Server data:                    
 *     200 OK
 *         OR
 *     4* error
 * </pre>
 * 
 * @memberOf http
 * @name send_message
 * @link controller.send_message
 * @param request
 **/
http.post('/message', views.send_message);

/**
 * Move the flag
 * <pre>
 * 
 * <b>url: /flag</b>           
 * methods: GET, POST
 * ..              
 * 
 * Client data:                    
 *     game_id: String
 *     user_id: String
 *     team: String
 *     latitude: Number
 *     longitude: Number
 * 
 * Server data:                    
 *     200 OK
 *         OR
 *     4* error
 * </pre>
 * 
 * @memberOf http
 * @name move_flag
 * @link controller.move_flag
 * @link ctf.game_data
 * @param request
 **/
 
http.post('/flag', views.move_flag);

/**
 * Returns a list of all games on this server
 * <pre>
 * 
 * <b>url: /game</b>                           
 * methods: GET    
 * ..                            
 * 
 * Client data:                                
 *     latitude: Number                        
 *     longitude: Number                       
 *     accuracy: Number                        
 *     user_id: String                         
 *     name: String                            
 * 
 * Server data:                                
 * {
 *     games: [
 *         {
 *             name: String,
 *             distance: Number,
 *             players: Number
 *         }
 *     ]
 * }
 * </pre>
 * 
 * @memberOf http
 * @name get_games
 * @link controller.get_games
 * @param request
 */
http.get('/game', views.get_games);

/**
 * Create a new game
 * <pre>
 * 
 * <b>url: /game</b>
 * methods: POST
 * ..
 * 
 * Client data:
 *     game_id: String
 *     latitude: Number
 *     longitude: Number
 *     name: String
 * 
 * Server data:
 * { "response": "OK" } (HTTP 200)
 *     OR
 * { "error": "..." } (HTTP 4*)
 * </pre>
 * 
 * @memberOf http
 * @name create_game
 * @link controller.create_game
 * @param request
 */
http.post('/game', views.create_game);

/**
 * Join a game
 * <pre>
 * 
 * <b>url: /game/:game_id</b>
 * methods: POST
 * ..
 * 
 * Client data:
 *     accuracy: Number
 *     auth_token: String
 *     latitude: Number
 *     longitude: Number
 *     name: String
 *     user_id: String
 * 
 * Server data:
 *     [game object]
 * </pre>
 * 
 * @memberOf http
 * @name join_game
 * @link controller.join_game
 * @link ctf.game_data
 * @param request
 */
http.post('/game/:game_id', views.join_game);

/**
 * Leave a game
 * <pre>
 * 
 * <b>url: /game/:game_id</b>
 * methods: DELETE
 * ..
 * 
 * Client data:
 *     user_id: String
 * 
 * Server data:
 *     200 OK
 *         OR
 *     410 Gone (User was not in game)
 *         OR
 *     404 Not Found (Game did not exist)
 * </pre>
 * 
 * @memberOf http
 * @name leave_game
 * @link controller.leave_game
 * @link ctf.game_data
 * @param request
 */
http['delete']('/game/:game_id/:user_id', views.leave_game);

// This is super s3cr3t :-)
http.get('/admin.json', function(request, response) {
    response.send(ctf.game_data);
});

fs.readFile('game_data.dat', function(err, data) {
    // Load game_data.dat
    if (! err) {
        try {
            ctf.game_data = JSON.parse(data);
            utils.purge_players();
            utils.purge_games();
        } catch(e) { }
    }
    
    // Start listening
    try {
        var port = process.ARGV[2] || 80;
        http.listen(port);
        console.log("Listening on port " + port);
    } catch (f) {
        http.listen(5555);
        console.log("Listening on port 5555");
    }
});