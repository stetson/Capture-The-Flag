#include "Algorithms.h"

/**
 * Utility function for converting degrees to radians
 *
 * @name toRad
 * @memberOf algorithms
 */
double Algorithms::toRad(double degrees) {
  return degrees * (PI / 180);
}

/**
 * Utility function for converting radians to degrees
 *
 * @name toDeg
 * @memberOf algorithms
 */
double Algorithms::toDeg(double radians) {
  return radians * (180 / PI);
}

/**
 * Calculate the distance between two geographic points in miles
 *
 * @name distance_in_miles
 * @memberOf algorithms
 * @param p1_latitude The latitude of the first point
 * @param p1_longitude The longitude of the first point
 * @param p2_latitude The latitude of the second point
 * @param p2_longitude The longitude of the second point
 * @return the distance in miles
 */
double Algorithms::distance_in_miles(double p1_latitude, double p1_longitude, double p2_latitude, double p2_longitude)
{

  // Get the difference between our two points
  // then convert the difference into radians
  double dLat = (toRad(p2_latitude) - toRad(p1_latitude));
  double dLon = (toRad(p2_longitude) - toRad(p1_longitude));

  // The Haversine formula
  double nA = pow ( sin(dLat/2), 2 ) + cos(toRad(p1_latitude)) * cos(toRad(p2_latitude)) * pow ( sin(dLon/2), 2 );
  double nC = 2 * atan2( sqrt(nA), sqrt( 1 - nA ));
  double nD = EARTH_RADIUS * nC;

  // Convert kilometers to miles
  nD = (nD * MILES_PER_KILOMETER);

  return nD;
}


/**
 * Determines if a coordinate lies within a rectangle
 *
 * @name in_rectangle
 * @memberOf algorithms
 * @param findLat
 * @param findLong
 * @param topLeftLat
 * @param topLeftLong
 * @param botRightLat
 * @param botRightLong
 * @return boolean indicating whether or not the given rectangle contains the point
 */
bool Algorithms::in_rectangle(double findLat, double findLong, double topLeftLat, double topLeftLong, double botRightLat, double botRightLong)
{
  bool isWithinRect = true;
  if (findLat > topLeftLat || findLong < topLeftLong || findLat < botRightLat || findLong > botRightLong)
  {
    isWithinRect = false;
  }
 return isWithinRect;
}

/**
 * Add a distance in miles to a GPS coordinate
 *
 * @name add_miles_to_coordinate
 * @memberOf algorithms
 * @param latitude
 * @param longitude
 * @param offset
 * @param bearing
 */
coord Algorithms::add_miles_to_coordinate(double latitude, double longitude, double offset, double bearing)
{

  // Convert offsets to kilometers
  offset = offset / MILES_PER_KILOMETER;
  bearing = toRad(bearing);
  double angular_distance = offset / EARTH_RADIUS;
  double new_latitude, new_longitude;

  // Calculate new coordinate
  new_latitude = asin(
      (
        sin(toRad(latitude)) * cos(angular_distance)
      ) + (
        cos(toRad(latitude)) * sin(angular_distance) * cos(bearing)
      )
  );
  new_longitude =
    toRad(longitude) +
    atan2(
      sin(bearing) * sin(angular_distance) * cos(toRad(latitude)),
      cos(angular_distance) - sin(toRad(latitude)) * sin(new_latitude)
    );

  // Normalize longitude
  new_longitude = fmod((new_longitude + 3 * PI), (2 * PI)) - PI;

  // Convert to degrees
  new_latitude = toDeg(new_latitude);
  new_longitude = toDeg(new_longitude);

  // Return value
  coord newCoord;
  newCoord.latitude = new_latitude;
  newCoord.longitude = new_longitude;
  newCoord.angular_distance = angular_distance;
  newCoord.bearing = bearing;
  newCoord.offset = offset;
  return newCoord;

}
