var algs = require('./build/default/Algorithms.node');
var data = new algs.Algorithms();
var Logic = require('./build/default/Logic.node');
var business = new Logic.Logic();

console.log("Testing Algorithms add function " + data.add(10));
console.log("Testing Logic function " + business.getworld());

