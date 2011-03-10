#include <v8.h>
#include <node.h>
#include <sstream>
#include <math.h>
#include <vector>
using namespace node;
using namespace v8;

// Earth's radius in Kilometers
#define EARTH_RADIUS 6378.137
//6371.009

// The estimated value of PI
#define PI 3.1415926535

// Miles to kilometer conversion factor
#define MILES_PER_KILOMETER 0.621371192

class Algorithms: ObjectWrap
{

private:
  int m_count;
  
public:

  static Persistent<FunctionTemplate> s_ct;

  /**
   * Configuration of the link between Node and C++ code
   */
  static void Init(Handle<Object> target)
  {
    HandleScope scope;

    Local<FunctionTemplate> t = FunctionTemplate::New(New);

    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("Algorithms"));

    // Brings the functions to the JS namespace via "Algorithms" (below)
    NODE_SET_PROTOTYPE_METHOD(s_ct, "distance_in_miles", distance_in_miles);
    NODE_SET_PROTOTYPE_METHOD(s_ct, "in_rectangle", in_rectangle);
    NODE_SET_PROTOTYPE_METHOD(s_ct, "add_miles_to_coordinate", add_miles_to_coordinate);

    // Brings the Algorithms object toe the JS namespace
    target->Set(String::NewSymbol("Algorithms"), s_ct->GetFunction());
	
  }

  /**
   * Constructor for C++
   */
  Algorithms() : m_count(0) { }

  /**
   * Constructor for js
   */
  static Handle<Value> New(const Arguments& args)
  {
    HandleScope scope;
    Algorithms* hw = new Algorithms();
    hw->Wrap(args.This());
    return args.This();
  }

  /**
   * Calculate the distance between two geographic points in miles
   * @param p1_latitude The latitude of the first point
   * @param p1_longitude The longitude of the first point
   * @param p2_latitude The latitude of the second point
   * @param p2_longitude The longitude of the second point
   * @return the distance in miles
   */
  static Handle<Value> distance_in_miles(const Arguments& args)
  {
    HandleScope scope;
    //Algorithms* hw = ObjectWrap::Unwrap<Algorithms>(args.This());
    
    // Get arguments
    Local<Value> arg0 = args[0];
    Local<Value> arg1 = args[1];
    Local<Value> arg2 = args[2];
    Local<Value> arg3 = args[3];

    // Convert them into doubles
    double nLat1 = arg0->NumberValue();
    double nLon1 = arg1->NumberValue();
    double nLat2 = arg2->NumberValue();
    double nLon2 = arg3->NumberValue();

    // Get the difference between our two points
    // then convert the difference into radians
    double nDLat = (nLat2 - nLat1) * (PI / 180);
    double nDLon = (nLon2 - nLon1) * (PI / 180);

    // The Haversine formula
    double nA = pow ( sin(nDLat/2), 2 ) + cos(nLat1) * cos(nLat2) * pow ( sin(nDLon/2), 2 );
    double nC = 2 * atan2( sqrt(nA), sqrt( 1 - nA ));
    double nD = EARTH_RADIUS * nC;

    // Convert kilometers to miles
    nD = (nD * MILES_PER_KILOMETER);

    // Return the result
    Local<Number> result = Number::New(nD);
    return scope.Close(result);
  }

  /**
   * Determines if a coordinate lies within a rectangle
   *
   * @param findLat
   * @param findLong
   * @param topLeftLat
   * @param topLeftLong
   * @param botRightLat
   * @param botRightLong
   * @return boolean indicating whether or not the given rectangle contains the point
   */
  static Handle<Value> in_rectangle(const Arguments& args)
  {
  
    // Setting scope and building an string stream for output
    HandleScope scope;
    std::stringstream out;
	
    // Grabbing function parameters
    double dFindLat = args[0]->NumberValue();
    double dFindLong = args[1]->NumberValue();
    double dTopLeftLat = args[2]->NumberValue();
    double dTopLeftLong = args[3]->NumberValue();
    double dBotRightLat = args[4]->NumberValue();
    double dBotRightLong = args[5]->NumberValue();
    bool isWithinRect = true;

    // Computations
    if (dFindLat > dTopLeftLat || dFindLong < dTopLeftLong || dFindLat < dBotRightLat || dFindLong > dBotRightLong)
    {
      isWithinRect = false;
    }
	
    // Returning the result
    Handle<Boolean> result = Boolean::New(isWithinRect);
    return scope.Close(result);
  }
  
  /**
   * Add a distance in miles to a GPS coordinate
   *
   * @param latitude
   * @param longitude
   * @param offset_lat
   * @param offset_long
   */
  static Handle<Value> add_miles_to_coordinate(const Arguments& args)
  {
    // Set scope
    HandleScope scope;

    // Declare some variables we'll use for the calculation
    double new_latitude;
    double new_longitude;

    // Grabbing function parameters
    double latitude = args[0]->NumberValue();
    double longitude = args[1]->NumberValue();
    double offset_lat = args[2]->NumberValue();
    double offset_long = args[3]->NumberValue();

    // Convert miles to kilometers
    offset_lat = (offset_lat / MILES_PER_KILOMETER);
    offset_long = (offset_long / MILES_PER_KILOMETER);

    // Calculate new coordinate
    new_latitude = latitude + (180 / PI) * (offset_lat / EARTH_RADIUS);
    new_longitude = longitude + (180 / PI) * (offset_long / EARTH_RADIUS) / cos(latitude);

    // Return value
    //double coordinate[] = {, };
    Local<Array> coordinate = Array::New(2);
    coordinate->Set(Number::New(0), Number::New(new_latitude));
    coordinate->Set(Number::New(1), Number::New(new_longitude));
    return scope.Close(coordinate);
  }
};

/**
 * Function template for Algorithms methods
 */
Persistent<FunctionTemplate> Algorithms::s_ct;

// Initalizes and creates the Algorithms module
extern "C" {
  // Creates scope
  static void init (Handle<Object> target)
  {
    Algorithms::Init(target);
  }

  // Passes scope to js
  NODE_MODULE(Algorithms, init);
}
