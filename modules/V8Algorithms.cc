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
  //double answer = 5;
  Local<Number> result = Number::New(answer);
  return scope.Close(result);

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
