#include <v8.h>
#include <node.h>
#include <sstream>
#include <math.h>
using namespace node;
using namespace v8;

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

    // Earth's radius in Kilometers
    double nRadius = 6371;

    // Get the difference between our two points
    // then convert the difference into radians
    double nDLat = (nLat2 - nLat1) * (3.1415926535 / 180);
    double nDLon = (nLon2 - nLon1) * (3.1415926535 / 180);

    // The Haversine formula
    double nA = pow ( sin(nDLat/2), 2 ) + cos(nLat1) * cos(nLat2) * pow ( sin(nDLon/2), 2 );
    double nC = 2 * atan2( sqrt(nA), sqrt( 1 - nA ));
    double nD = nRadius * nC;

    // Convert kilometers to miles
    nD = (nD * 0.621371192);

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
