/**
 * server.js
 * 
 * This is the main application class, and controls
 * daemonization, imports, and routing.
 * 
 * @author Allen Carroll
 */

// Imports

/**
 * The express framework and HTTP middleware
 */
var express = require("express");

/**
 * The views which will handle incoming requests
 * and return the necessary JSON
 * 
 * @namespace views
 */
var views = require("./backend/views.js");

/** 
 * The server object which controls all routes
 * 
 * @namespace http
 */
var http = express.createServer();
http.use(express.bodyDecoder());

// Routes

	//
	// Static routes
	//
	
	/**
	 * Static files for frontend <br />
	 * <b>url: /+</b>
	 * 
	 * @memberOf http
	 * @name frontend 
	 **/
	http.use(express.staticProvider('./frontend/'));
	
	/**
	 * Documentation <br />
	 * <b>url: /+</b>
	 * 
	 * @memberOf http
	 * @name docs 
	 **/
	http.use(express.staticProvider('./docs/'));
	
	//
	// Capture the flag routes
	//	
	
	/**
	 * Calls views.update_location <br />
	 * <b>url: /location</b><br />
	 * methods: POST
	 * 
	 * @memberOf http
	 * @name location
	 * @link views.update_location 
	 **/
	http.post('/location', views.update_location);

// Start listening
try {
	http.listen(80);
} catch (e) {
	http.listen(5555);
};