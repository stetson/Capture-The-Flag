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
 * Player object, which holds all information related to the player
 *
 * @memberOf models
 * @name Player
 */

exports.Player = new Schema({
	id: ObjectId,
	name: { type: String, validate: /[a-z]/ },
	user_id: {type: String }
});

/**
* Game object, which holds information regarding boundaries
* and game location
*
* @memberOf models
* @name Game
*/

exports.Game = new Schema({
	id: ObjectId,
    teams: [Team],
    initial_location: [Coordinate]
});

/**
 * Team object, used for proper load balancing of players
 * on teams
 *
 * @memberOf models
 * @name Team
 */
exports.Team = new Schema({
    players: [Player] 
});

/**
* Coordinate object, which holds a GPS coordinate,
* and the accuracy in meters
*
* @memberOf models
* @name Coordinate
*/
exports.Coordinate = new Schema({
	latitude: Number,
	longitude: Number,
	accuracy: Number
});