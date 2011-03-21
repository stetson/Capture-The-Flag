var modAlgorithms = require('./build/default/V8Algorithms.node');
var algo = new modAlgorithms.V8Algorithms();


console.log(" distance(60,1.849444,52.204444,0.140555)\n -> " + algo.distance_in_miles(60,1.849444,52.204444,0.140555)+ " miles");

