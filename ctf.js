/**
 * ctf.js
 * 
 * This is the main application class, and controls
 * daemonization, imports, and routing.
 * 
 * @author Allen Carroll
 */

// Imports
var express = require("express");
var views = require("./backend/views.js");

// Create the server
var http = express.createServer();

// Routes

	// Static routes
	http.use(express.staticProvider('./'));
	http.get('/', function(request, response) {
		response.sendfile("static/index.html");
	});
	
	// Capture the flag routes
	http.put('/location', views.update_location);

// Start listening
http.listen(5555);
console.log('CTF server running at http://127.0.0.1:5555/');