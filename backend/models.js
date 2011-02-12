/**
 * Models.js
 * 
 * These are the models that will handle all of our
 * database access
 * 
 * @author Laura Seletos
 */

// Import Mongoose into namespace and connect to server
var mongoose = require("mongoose");
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
mongoose.connect("mongodb://localhost/ctf");

/**
 * Player object, which holds all information related to the player
 */
exports.Player = new Schema({
	
});

/**
 * Game object, which holds information regarding boundaries
 * and game location
 */
exports.Game = new Schema({
	
});

/**
 * Team object, used for proper load balancing of players
 * on teams
 */
exports.Team = new Schema({
	
});

/**
 * Coordinate object, which holds a GPS coordinate,
 * and the accuracy in meters
 */
exports.Coordinate = new Schema({
	
});