/**
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

// Elizabeth Hall
var point1 = {
    latitude: 29.034681,
    longitude: -81.303774
};

// The CUB circle
var point2 = {
    latitude: 29.036466,
    longitude: -81.302269
};

// The print shop
var point3 = {
    latitude: 29.035772,
    longitude: -81.30283
};

// Stover theatre
var point4 = {
    latitude: 29.036757,
    longitude: -81.305394
};

var tolerance = 0.0018; // 3m is more than sufficient

/**
 * Test that distance calculations are within required range
 */
exports.test_distance = function(test) {    
    var distance = algorithms.distance_in_miles(point1.latitude, point1.longitude, point2.latitude, point2.longitude);
    
    test.ok(distance > 0.14, "Distance not within required range (" + distance + ")");
    test.ok(distance < 0.16, "Distance not within required range (" + distance + ")");
    test.done();
};

/**
 * Test that in_rectangle calculation accurately predicts whether or
 * not points are contained
 */
exports.test_in_rectangle = function(test) {
    test.strictEqual(false, algorithms.in_rectangle(point4.latitude, point4.longitude,
            point2.latitude, point1.longitude,
            point1.latitude, point2.longitude));
    test.strictEqual(true, algorithms.in_rectangle(point3.latitude, point3.longitude,
                                                  point2.latitude, point1.longitude,
                                                  point1.latitude, point2.longitude));
    test.done();
};

/**
 * Test that adding distance to a coordinate returns points
 * where we expect them
 */
exports.test_add_miles = function(test) {
	// Adding nothing should return the same point
	point5 = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0, 0);
	test.equal(point1.latitude, point5.latitude);
	test.equal(point1.longitude, point5.longitude);
	
	point6 = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, -0.5, 0.5);
	test.ok(Math.abs(29.027483 - point6.latitude) < tolerance, "Latitude not within tolerance: " + Math.abs(29.026481 - point6.latitude) + " is greater than " + tolerance);
	test.ok(Math.abs(-81.312074 - point6.longitude) < tolerance, "Longitude not within tolerance: " + Math.abs(-81.311974 - point6.longitude) + " is greater than " + tolerance);
	
	test.done();
};