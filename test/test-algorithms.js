/**
 * Algorithms for various geospatial math
 */
algorithms_class = require("../modules/build/default/Algorithms.node");
var algorithms = new algorithms_class.Algorithms();

// Elizabeth Hall
var point1 = {
    latitide: 29.034681,
    longitude: -81.303774
};

// The CUB circle
var point2 = {
    latitide: 29.036466,
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
    var distance = algorithms.distance_in_miles(point1.latitide, point1.longitude, point2.latitide, point2.longitude);
    
    test.ok(distance > 0.14, "Distance not within required range (" + distance + ")");
    test.ok(distance < 0.16, "Distance not within required range (" + distance + ")");
    test.done();
};

/**
 * Test that in_rectangle calculation accurately predicts whether or
 * not points are contained
 */
exports.test_in_rectangle = function(test) {
    test.deepEqual(false, algorithms.in_rectangle(point4.latitude, point4.longitude,
            point2.latitide, point1.longitude,
            point1.latitide, point2.longitude));
    test.deepEqual(true, algorithms.in_rectangle(point3.latitude, point3.longitude,
                                                  point2.latitide, point1.longitude,
                                                  point1.latitide, point2.longitude));
    test.done();
};