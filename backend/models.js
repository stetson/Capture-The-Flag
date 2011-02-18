/**
* Models.js
*
* These are the models that will handle all of our
* database access
*
* @author Laura Seletos
*/

/**
* The settings object
*/
var settings = require("../settings.js");

/**
 * The Node.js MongoDB adapter
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
mongoose.connect(settings.mongodb_url);

/**
* Coordinate object, which holds a GPS coordinate,
* and the accuracy in meters
*
* @memberOf models
* @name Coordinate
*/
var Coordinate = new Schema({
	latitude: Number,
	longitude: Number,
	accuracy: Number
});

/**
 * Player object, which holds all information related to the player
 *
 * @memberOf models
 * @name Player
 */

var Player = new Schema({
	id: ObjectId,
	name: { type: String, validate: /[a-z]/ },
	user_id: {type: String }
});

/**
 * Team object, used for proper load balancing of players
 * on teams
 *
 * @memberOf models
 * @name Team
 */
var Team = new Schema({
    players: [Player] 
});

/**
* Game object, which holds information regarding boundaries
* and game location
*
* @memberOf models
* @name Game
*/

var Game = new Schema({
	id: ObjectId,
    teams: [Team],
    initial_location: [Coordinate]
});

// Export
exports.Coordinate = Coordinate;
exports.Player = Player;
exports.Team = Team;
exports.Game = Game;