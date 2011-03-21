#ifndef ALGORITHMS_H
#define ALGORITHMS_H

// Earth's radius in Kilometers
#define EARTH_RADIUS 6371.009

// The estimated value of PI
#define PI 3.1415926535

// Miles to kilometer conversion factor
#define MILES_PER_KILOMETER 0.621371192

#include <sstream>
#include <math.h>
#include <vector>

struct coord {
  double latitude, longitude, angular_distance, bearing, offset;
};

class Algorithms
{

  private:
  
  public:
    static double toRad(double degrees);
    static double toDeg(double radians);
    static double distance_in_miles(double p1_latitude, double p1_longitude, double p2_latitude, double p2_longitude);
    static bool in_rectangle(double findLat, double findLong, double topLeftLat, double topLeftLong, double botRightLat, double botRightLong);
    static coord add_miles_to_coordinate(double latitude, double longitude, double offset, double bearing);

};

#endif
