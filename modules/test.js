// Module requirments
var modAlgorithms = require('./build/default/Algorithms.node');
var algo = new modAlgorithms.Algorithms();
var modLogic = require('./build/default/Logic.node');
var logic = new modLogic.Logic();

// Coord struct
function Coord(lati, longi)
{
  this.latitude = lati;
  this.longitude= longi;
}

// Testing algorithms
console.log("[Algorithms.cc]")
console.log(" distance(data.distance(60,1.849444,52.204444,0.140555)\n -> " + algo.distance(60,1.849444,52.204444,0.140555)+ " km");

console.log(" in_rectangle(...good...)\n -> " + algo.in_rectangle(29.053769,-81.300201,29.102977,-81.359253,28.982916,-81.232911));
console.log(" in_rectangle(...bad....)\n -> " + algo.in_rectangle(29.282806,-80.661621,29.102977,-81.359253,28.982916,-81.232911));


// Testing business logic
console.log("[Logic.cc]")
console.log(" getWorld()\n -> " + logic.getWorld());

