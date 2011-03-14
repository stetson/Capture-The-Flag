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

/**
 * Test that distance calculations are within required range
 */
exports.test_distance = function(test) {    
    var distance = algorithms.distance_in_miles(point1.latitude, point1.longitude, point2.latitude, point2.longitude);
    
    test.ok(distance.toFixed(4) - 0.1532, "Distance calculation not within tolerance (" + Math.abs(distance - 0.153230136) + "mi off)");
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
	test.equal(point1.latitude.toFixed(4), point5.latitude.toFixed(4));
	test.equal(point1.longitude.toFixed(4), point5.longitude.toFixed(4));
	
    point_NE = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, 0.5);
	test.equal('29.0419', point_NE.latitude.toFixed(4), "NE Latitude not within tolerance: " + Math.abs(29.0419 - point_NE.latitude));
	test.equal('-81.2956', point_NE.longitude.toFixed(4), "NE Longitude not within tolerance: " + Math.abs(-81.2956 - point_NE.longitude));

    point_NW = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, -0.5);
    test.equal('29.0419', point_NW.latitude.toFixed(4), "NW Latitude not within tolerance: " + Math.abs(29.0419 - point_NW.latitude));
    test.equal('-81.3119', point_NW.longitude.toFixed(4), "NW Longitude not within tolerance: " + Math.abs(-81.3119 - point_NW.longitude));

    point_SE = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, -0.5, 0.5);
    test.equal('29.0275', point_SE.latitude.toFixed(4), "NE Latitude not within tolerance: " + Math.abs(29.0275 - point_SE.latitude));
    test.equal('-81.3038', point_SE.longitude.toFixed(4), "NE Longitude not within tolerance: " + Math.abs(-81.3038 - point_SE.longitude));

    point_SW = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, -0.5, -0.5);
    test.equal('29.0275', point_SW.latitude.toFixed(4), "NW Latitude not within tolerance: " + Math.abs(29.0275 - point_SW.latitude));
    test.equal('-81.3119', point_SW.longitude.toFixed(4), "NW Longitude not within tolerance: " + Math.abs(-81.3119 - point_SW.longitude));

	test.done();
};

/**
 * Test the integrity of the algorithms by using one to reverse the other
 */
exports.test_integrity = function(test) {
    point1_moved = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, -0.5);
    test.equal(0.707107, algorithms.distance_in_miles(point1.latitude, point1.longitude, point1_moved.latitude, point1_moved.longitude));
    test.done();
};