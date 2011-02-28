// Module requirments
var modAlgorithms = require('./build/default/Algorithms.node');
var algo = new modAlgorithms.Algorithms();
var modLogic = require('./build/default/Logic.node');
var logic = new modLogic.Logic();

// Testing algorithms
console.log("[Algorithms.cc]")
console.log("  add(10) => " + algo.add(10));
console.log("  diff(13, 7) => " + algo.diff(13, 7));

// Testing business logic
console.log("[Logic.cc]")
console.log("  getWorld() => " + logic.getWorld());

