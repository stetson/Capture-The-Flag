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
    var distance1 = algorithms.distance_in_miles(point1.latitude, point1.longitude, point2.latitude, point2.longitude);
    var distance2 = algorithms.distance_in_miles(point1.latitude, point1.longitude, point3.latitude, point3.longitude);
    var distance3 = algorithms.distance_in_miles(point1.latitude, point1.longitude, point4.latitude, point4.longitude);
    
    test.equal('0.1532', distance1.toFixed(4), "Distance calculation not within tolerance (" + Math.abs(distance1 - 0.153230136) + "mi off)");
    test.equal('0.0945', distance2.toFixed(4), "Distance calculation not within tolerance (" + Math.abs(distance2 - 0.0945105583) + "mi off)");
    test.equal('0.1736', distance3.toFixed(4), "Distance calculation not within tolerance (" + Math.abs(distance3 - 0.173673248) + "mi off)");
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
	
	// Test cases from running script at http://www.movable-type.co.uk/scripts/latlong.html
	
    point_NE = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, 45);
	test.equal('29.0398', point_NE.latitude.toFixed(4), "NE Latitude not within tolerance: " + Math.abs(29.0419 - point_NE.latitude));
	test.equal('-81.2979', point_NE.longitude.toFixed(4), "NE Longitude not within tolerance: " + Math.abs(-81.2956 - point_NE.longitude));
	
    point_SE = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, 135);
    test.equal('29.0296', point_SE.latitude.toFixed(4), "SE Latitude not within tolerance: " + Math.abs(29.0275 - point_SE.latitude));
    test.equal('-81.2979', point_SE.longitude.toFixed(4), "SE Longitude not within tolerance: " + Math.abs(-81.3038 - point_SE.longitude));
    
    point_SW = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, 225);
    test.equal('29.0296', point_SW.latitude.toFixed(4), "SW Latitude not within tolerance: " + Math.abs(29.0275 - point_SW.latitude));
    test.equal('-81.3096', point_SW.longitude.toFixed(4), "SW Longitude not within tolerance: " + Math.abs(-81.3119 - point_SW.longitude));

    point_NW = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, 315);
    test.equal('29.0398', point_NW.latitude.toFixed(4), "NW Latitude not within tolerance: " + Math.abs(29.0419 - point_NW.latitude));
    test.equal('-81.3096', point_NW.longitude.toFixed(4), "NW Longitude not within tolerance: " + Math.abs(-81.3119 - point_NW.longitude));

	test.done();
};

/**
 * Test the integrity of the algorithms by using one to reverse the other
 */
exports.test_integrity = function(test) {
    point1_moved = algorithms.add_miles_to_coordinate(point1.latitude, point1.longitude, 0.5, 315);
    test.equal('0.5000', algorithms.distance_in_miles(point1.latitude, point1.longitude, point1_moved.latitude, point1_moved.longitude).toFixed(4));
    test.equal('0.5000', algorithms.distance_in_miles(point1.latitude, point1.longitude, 29.0397979, -81.3096268).toFixed(4));
    test.done();
};