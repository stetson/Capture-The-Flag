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
var SchemaType = require('../schematype')
  , CastError = SchemaType.CastError;




/**
* Player object, which holds all information related to the player
*
* @memberOf models
* @name Player
*/

var Player = new Schema({
    name     : { type: String, validate: /[a-z]/ }
  , team     : [Team]
  , user_id  : {type: String}
});


exports.Player = new Schema({

});



/**
* Game object, which holds information regarding boundaries
* and game location
*
* @memberOf models
* @name Game
*/

var Game = new Schema({
    player     :  [Player]
  , team       :  [Team]
  , coordinate :  [Coordinate]
 
});


exports.Game = new Schema({

});



/**
* Team object, used for proper load balancing of players
* on teams
*
* @memberOf models
* @name Team
*/


var Team = new Schema({
    name  :  { type: String, validate: /[a-z]/ }
 
});



exports.Team = new Schema({

});




/**
* Coordinate object, which holds a GPS coordinate,
* and the accuracy in meters
*
* @memberOf models
* @name Coordinate
*/


var Coordinate = new Schema({
  name  :  { type: String, validate: /[a-z]/ }
 
});


exports.Coordinate = new Schema({

});