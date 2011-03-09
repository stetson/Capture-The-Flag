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
 * The global object used for storing application data
 */
global.ctf = {};
ctf.game_data = {};

/**
 * Constants for use in the program
 */
ctf.constants = {
    MINUTE: 60*1000,
    SECOND: 1000,
    DISABLE_USER_INTERVAL: 1, // Disable users which have not reported their location in this period of time (in minutes)
    PURGE_USER_INTERVAL: 5, // Purge users which have not reported their location in this period of time (in minutes)
    PURGE_GAMES_INTERVAL: 20, // Purge games which have not been updated in this period of time (in minutes)
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
 * Algorithms for various geospatial math
 */
algorithms_class = require("./modules/build/default/Algorithms.node");
ctf.algorithms = new algorithms_class.Algorithms();

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

fs.readFile('game_data.dat', function(err, data) {
    // Load game_data.dat
    if (! err) {
        try {
            ctf.game_data = JSON.parse(data);
        } catch(e) { }
    }
        
    /** 
     * The server object which controls all routes
     * 
     * @namespace http
     */
    ctf.http = express.createServer();
    ctf.http.use(express.bodyDecoder());
	
	/**
	 * Static files for frontend <br />
	 * <b>url: /+</b>
	 * 
	 * @memberOf http
	 * @name frontend 
	 **/
	ctf.http.use(express.staticProvider('./frontend/'));
	
	/**
	 * Documentation <br />
	 * <b>url: /+</b>
	 * 
	 * @memberOf http
	 * @name docs 
	 **/
	ctf.http.use(express.staticProvider('./docs/'));
	
	/**
	 * Calls views.update_location <br />
	 * <b>url: /location</b><br />
	 * methods: GET, POST
	 * 
	 * @memberOf http
	 * @name location
	 * @link controller.location 
	 **/
	ctf.http.post('/location', views.update_location);
	ctf.http.get('/location', views.get_location);
	
	/**
	 * Returns a list of all games on this server<br />
	 * <b>url: /game</b><br />
	 * methods: GET
	 * 
	 * @memberOf http
	 * @name get_games
	 * @link controller.get_games
	 */
	ctf.http.get('/game', views.get_games);
	
	/**
     * Create a new game<br />
     * <b>url: /game</b><br />
     * methods: POST
     * 
     * @memberOf http
     * @name create_game
     * @link controller.create_game
     */
	ctf.http.post('/game', views.create_game);
	
	/**
     * Join a game<br />
     * <b>url: /game/:game_id</b><br />
     * methods: POST
     * 
     * @memberOf http
     * @name join_game
     * @link controller.join_game
     */
    ctf.http.post('/game/:game_id', views.join_game);
    
    // Start listening
    try {
        ctf.http.listen(80);
        console.log("Listening on port 80");
    } catch (f) {
        ctf.http.listen(5555);
        console.log("Listening on port 5555");
    }
});