#include "V8Algorithms.h"
#include "Algorithms.h"

/**
 * Configuration of the link between Node and C++ code
 */
void V8Algorithms::Init(Handle<Object> target)
{
  HandleScope scope;

  Local<FunctionTemplate> t = FunctionTemplate::New(New);

  s_ct = Persistent<FunctionTemplate>::New(t);
  s_ct->InstanceTemplate()->SetInternalFieldCount(1);
  s_ct->SetClassName(String::NewSymbol("Algorithms"));

  // Brings the functions to the JS namespace via "Algorithms" (below)
  NODE_SET_PROTOTYPE_METHOD(s_ct, "distance_in_miles", distance_in_miles);
  NODE_SET_PROTOTYPE_METHOD(s_ct, "add_miles_to_coordinate", add_miles_to_coordinate);

  // Brings the Algorithms object to the JS namespace
  target->Set(String::NewSymbol("Algorithms"), s_ct->GetFunction());

}

Handle<Value> V8Algorithms::New(const Arguments& args)
{
    HandleScope scope;
    V8Algorithms* hw = new V8Algorithms();
    hw->Wrap(args.This());
    return args.This();
}

// Wrapper for distance_in_miles()
Handle<Value> V8Algorithms::distance_in_miles(const Arguments& args)
{
  HandleScope scope;
  // Get arguments
  Local<Value> arg0 = args[0];
  Local<Value> arg1 = args[1];
  Local<Value> arg2 = args[2];
  Local<Value> arg3 = args[3];
    
  // Convert them into doubles
  double latitude1 = arg0->NumberValue();
  double longitude1 = arg1->NumberValue();
  double latitude2 = arg2->NumberValue();
  double longitude2 = arg3->NumberValue();

  // Grab answer from Algorithms class
  double answer = Algorithms::distance_in_miles(latitude1,longitude1,latitude2,longitude2);

  Local<Number> result = Number::New(answer);
  return scope.Close(result);

}

Handle<Value> V8Algorithms::add_miles_to_coordinate(const Arguments& args)
{

  HandleScope scope;

  // Convert arguments to doubles
  double argLat = args[0]->NumberValue();
  double argLong = args[1]->NumberValue();
  double argOff = args[2]->NumberValue();
  double argBear = args[3]->NumberValue();

  // Grab answer from Algorithms class
  coord answer = Algorithms::add_miles_to_coordinate(argLat, argLong, argOff, argBear);

  // Return value
  Local<Object> coordinate = Object::New();
  coordinate->Set(String::New("latitude"), Number::New(answer.latitude));
  coordinate->Set(String::New("longitude"), Number::New(answer.longitude));
  coordinate->Set(String::New("angular_distance"), Number::New(answer.angular_distance));
  coordinate->Set(String::New("bearing"), Number::New(answer.bearing));
  coordinate->Set(String::New("offset"), Number::New(answer.offset));
  return scope.Close(coordinate);
}


/**
 * Function template for Algorithms methods
 */
Persistent<FunctionTemplate> V8Algorithms::s_ct;

// Initalizes and creates the Algorithms module
extern "C" {
  // Creates scope
  static void init (Handle<Object> target)
  {
    V8Algorithms::Init(target);
  }

  // Passes scope to js
  NODE_MODULE(Algorithms, init);
}
