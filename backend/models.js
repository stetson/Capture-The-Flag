/**
 * Models.js
 * 
 * These are the models that will handle all of our
 * database access
 * 
 * @author Laura Seletos
 */

/**
 * The Node.js MongoDB adapter
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
mongoose.connect("mongodb://ctf_user:B1FC2BA863F335F0BDA65818130F1CFBBD52AE82A17AE850F9882F30456FF1F1@hatch.local.mongohq.com:27045/ctf");

/**
 * Player object, which holds all information related to the player
 * 
 * @memberOf models
 * @name Player
 */
exports.Player = new Schema({
	
});

/**
 * Game object, which holds information regarding boundaries
 * and game location
 * 
 * @memberOf models
 * @name Game
 */
exports.Game = new Schema({
	
});

/**
 * Team object, used for proper load balancing of players
 * on teams
 * 
 * @memberOf models
 * @name Team
 */
exports.Team = new Schema({
	
});

/**
 * Coordinate object, which holds a GPS coordinate,
 * and the accuracy in meters
 * 
 * @memberOf models
 * @name Coordinate
 */
exports.Coordinate = new Schema({
	
});