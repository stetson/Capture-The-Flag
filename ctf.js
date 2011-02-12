/**
 * ctf.js
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

// Routes

	//
	// Static routes
	//

	/**
	 * Index file <br />
	 * url: /
	 * 
	 * @memberOf http
	 * @name root 
	 **/
	http.use(express.staticProvider('./'));
	
	/**
	 * Static files <br />
	 * url: /static
	 * 
	 * @memberOf http
	 * @name static 
	 **/
	http.get('/', function(request, response) {
		response.sendfile("static/index.html");
	});
	
	//
	// Capture the flag routes
	//	
	
	/**
	 * Calls views.update_location <br />
	 * url: /location <br />
	 * methods: PUT
	 * 
	 * @memberOf http
	 * @name location
	 * @link views.update_location 
	 **/
	http.put('/location', views.update_location);

// Start listening
http.listen(5555);
console.log('CTF server running at http://127.0.0.1:5555/');