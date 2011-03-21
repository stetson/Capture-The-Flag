#include "Algorithms.cc"
#include "V8Algorithms.h"

/**
 * Configuration of the link between Node and C++ code
 */
void V8Algorithms::Init(Handle<Object> target)
{
  HandleScope scope;

  Local<FunctionTemplate> t = FunctionTemplate::New(New);

  s_ct = Persistent<FunctionTemplate>::New(t);
  s_ct->InstanceTemplate()->SetInternalFieldCount(1);
  s_ct->SetClassName(String::NewSymbol("V8Algorithms"));

  // Brings the functions to the JS namespace via "Algorithms" (below)
  NODE_SET_PROTOTYPE_METHOD(s_ct, "distance_in_miles", distance_in_miles);
  //NODE_SET_PROTOTYPE_METHOD(s_ct, "in_rectangle", in_rectangle);
  //NODE_SET_PROTOTYPE_METHOD(s_ct, "add_miles_to_coordinate", add_miles_to_coordinate);

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

// Algorithms *algo = ObjectWrap::Unwrap<Algorithms>(args.Holder());

  double answer = Algorithms::distance_in_miles(latitude1,longitude1,latitude2,longitude2);
   Local<Number> result = Number::New(answer);



  return scope.Close(result);
}/*
Handle<Value> V8Algorithms::in_rectangle(const Arguments& args)
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

   // bool isWithinRect = Algorithms::in_rectangle(dFindLat, dFindLong, dTopLeftLat, dTopLeftLong, dBotRightLat, dBotRightLong);

    // Returning the result
    Handle<Boolean> result = Boolean::New(isWithinRect);
    return scope.Close(result);
}*/

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
  NODE_MODULE(V8Algorithms, init);
}
