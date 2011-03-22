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
 * The global object used for storing application data  <br /><br />
 * 
 * Example:                                             <br />
 * {<br />
 *     game_id: {<br />
 *         // The point of origin of the game<br />
 *         origin: {<br />
 *             latitude: Number,<br />
 *             longitude: Number<br />
 *         },<br />
 *<br />         
 *         // The position of the red flag<br />
 *         red_flag: {<br />
 *             latitude: Number,<br />
 *             longitude: Number,<br />
 *             ...<br />
 *         },<br />
 *<br />         
 *         // The position of the blue flag<br />
 *         blue_flag: {<br />
 *             latitude: Number,<br />
 *             longitude: Number,<br />
 *             ...<br />
 *         },<br />
 *<br />         
 *         // The bounds of the red territory<br />
 *         red_bounds: {<br />
 *             top_left: {<br />
 *                 latitude: Number,<br />
 *                 longitude: Number,<br />
 *                 ...<br />
 *             },<br />
 *             bottom_right: {<br />
 *                 latitude: Number,<br />
 *                 longitude: Number,<br />
 *                 ...<br />
 *             }<br />
 *         },<br />
 *<br />         
 *         // The bounds of the blue territory<br />
 *         blue_bounds: {<br />
 *             top_left: {<br />
 *                 latitude: Number,<br />
 *                 longitude: Number,<br />
 *                 ...<br />
 *             },<br />
 *             bottom_right: {<br />
 *                 latitude: Number,<br />
 *                 longitude: Number,<br />
 *                 ...<br />
 *             }<br />
 *         },<br />
 *<br />         
 *         // The number of red players<br />
 *         red: Number,<br />
 *<br />         
 *         // The number of blue players<br />
 *         blue: Number,<br />
 *<br />         
 *         // The last time anyone in this game updated<br />
 *         last_update: DateTime,<br />
 *<br />         
 *         // The player objects<br />
 *         players: {<br />
 *<br />         
 *             // A player object, keyed by user_id<br />
 *             user_id: {<br />
 *                 latitude: Number,<br />
 *                 longitude: Number,v
 *                 accuracy: Number,<br />
 *                 auth_token: String,<br />
 *                 user_id: String,<br />
 *                 name: String,<br />
 *                 game_id: String,<br />
 *                 last_update: DateTime<br />
 *             },<br />
 *             ...<br />
 *         }<br />
 *     },<br />
 *     ...<br />
 * }<br />
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

fs.readFile('game_data.dat', function(err, data) {
    // Load game_data.dat
    if (! err) {
        try {
            ctf.game_data = JSON.parse(data);
            utils.purge_players();
            utils.purge_games();
        } catch(e) { }
    }
        
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
	 * <b>url: /+</b>
	 * 
	 * @memberOf http
	 * @name frontend 
	 **/
	http.use(express.static('./frontend/'));
	
	/**
	 * Documentation <br />
	 * <b>url: /+</b>
	 * 
	 * @memberOf http
	 * @name docs 
	 **/
	http.use(express.static('./docs/'));
	
	/**
	 * Updates the user's location     <br />
	 * <b>url: /location</b>           <br />
	 * methods: GET, POST              <br /><br />
	 * 
	 * Client data:                    <br />
	 *     accuracy: Number            <br />
	 *     auth_token: String<br />
	 *     game_id: String<br />
	 *     latitude: Number<br />
	 *     longitude: Number<br />
	 *     name: String<br />
	 *     user_id: String<br /><br />
	 * 
	 * Server data:                    <br />
	 *     {<br />
	 *         user_id: {<br />
	 *             latitude: Number,<br />
	 *             longitude: Number,<br />
	 *             accuracy: Number,<br />
	 *             auth_token: String,<br />
	 *             user_id: String,<br />
	 *             name: String,<br />
	 *             game_id: String,<br />
	 *             last_update: DateTime<br />
	 *         },<br />
	 *         ...<br />
	 *     }<br />
	 * 
	 * @memberOf http
	 * @name location
	 * @link controller.location 
	 **/
	http.post('/location', views.update_location);
	
	/**
	 * Returns a list of all games on this server  <br />
	 * <b>url: /game</b>                           <br />
	 * methods: GET                                <br /><br />
     * 
     * Client data:                                <br />
     *     latitude: Number                        <br />
     *     longitude: Number                       <br />
     *     accuracy: Number                        <br />
     *     user_id: String                         <br />
     *     name: String                            <br /><br />
     * 
     * Server data:                                <br />
     * [ "game_name", "game_name", ... ]
	 * 
	 * @memberOf http
	 * @name get_games
	 * @link controller.get_games
	 */
	http.get('/game', views.get_games);
	
	/**
     * Create a new game                            <br />
     * <b>url: /game</b>                            <br />
     * methods: POST                                <br /><br />
     * 
     * Client data:                                 <br />
     *     game_id: String                          <br />
     *     latitude: Number                         <br />
     *     longitude: Number                        <br />
     *     name: String                             <br /><br />
     * 
     * Server data:                                 <br />
     * { "response": "OK" } (HTTP 200)              <br />
     *     OR                                       <br />
     * { "error": "..." } (HTTP 4*)                 <br />
     * 
     * @memberOf http
     * @name create_game
     * @link controller.create_game
     */
	http.post('/game', views.create_game);
	
	/**
     * Join a game                                  <br />
     * <b>url: /game/:game_id</b>                   <br />
     * methods: POST                                <br /><br />
     * 
     * Client data:                                 <br />
     *     accuracy: Number                         <br />
     *     auth_token: String                       <br />
     *     latitude: Number                         <br />
     *     longitude: Number                        <br />
     *     name: String                             <br />
     *     user_id: String                          <br />
     * 
     * @memberOf http
     * @name join_game
     * @link controller.join_game
     */
    http.post('/game/:game_id', views.join_game);
    
    // This is super s3cr3t :-)
    http.get('/admin.json', function(request, response) {
        response.send(ctf.game_data);
    });
    
    // Start listening
    try {
        http.listen(80);
        console.log("Listening on port 80");
    } catch (f) {
        http.listen(5555);
        console.log("Listening on port 5555");
    }
});