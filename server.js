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

// Create global object
global.ctf = {};

/**
 * The global object used for storing application data  <br />
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
 *         // The last time anyone in this game updated
 *         last_update: DateTime,
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
 *                 last_update: DateTime
 *             },
 *             ...
 *         }
 *     },
 *     ...
 * }
 * </pre>
 *
 * @name game_data
 */
ctf.game_data = {};

/**
 * Constants for use in the program
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
 * Updates the user's location     <br />
 * <pre>
 * <b>url: /location</b>           
 * methods: GET, POST              
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
 *     {
 *         user_id: {
 *             latitude: Number,
 *             longitude: Number,
 *             accuracy: Number,
 *             auth_token: String,
 *             user_id: String,
 *             name: String,
 *             game_id: String,
 *             last_update: DateTime
 *         },
 *         ...
 *     }
 * </pre>
 * 
 * @memberOf http
 * @name post_location
 * @link controller.location 
 * @param request
 **/
http.post('/location', views.update_location);

/**
 * Returns a list of all games on this server  <br />
 * <pre>
 * <b>url: /game</b>                           
 * methods: GET                                
 * 
 * Client data:                                
 *     latitude: Number                        
 *     longitude: Number                       
 *     accuracy: Number                        
 *     user_id: String                         
 *     name: String                            
 * 
 * Server data:                                
 * [ "game_name", "game_name", ... ]
 * </pre>
 * 
 * @memberOf http
 * @name get_game
 * @link controller.get_games
 * @param request
 */
http.get('/game', views.get_games);

/**
 * Create a new game <br />
 * <pre>
 * <b>url: /game</b>
 * methods: POST
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
 * @name post_game
 * @link controller.create_game
 * @param request
 */
http.post('/game', views.create_game);

/**
 * Join a game                                  <br />
 * <pre>
 * <b>url: /game/:game_id</b>
 * methods: POST
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
 *     {
 *         team: String,
 *         red_flag: {
 *             latitude: Number,
 *             longitude: Number,
 *             ...
 *         },
 *         blue_flag: {
 *             latitude: Number,
 *             longitude: Number,
 *             ...
 *         },
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
 *         }
 *     }
 * </pre>
 * 
 * @memberOf http
 * @name post_game_id
 * @link controller.join_game
 * @param request
 */
http.post('/game/:game_id', views.join_game);

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
        http.listen(80);
        console.log("Listening on port 80");
    } catch (f) {
        http.listen(5555);
        console.log("Listening on port 5555");
    }
});