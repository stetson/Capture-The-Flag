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

  static void Init(Handle<Object> target)
  {
    HandleScope scope;

    Local<FunctionTemplate> t = FunctionTemplate::New(New);

    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("Algorithms"));

    // Brings the functions to the JS namespace via "Algorithms" (below)
    NODE_SET_PROTOTYPE_METHOD(s_ct, "distance", distance);
    NODE_SET_PROTOTYPE_METHOD(s_ct, "in_rectangle", in_rectangle);

    // Brings the Algorithms object toe the JS namespace
    target->Set(String::NewSymbol("Algorithms"), s_ct->GetFunction());
	
  }

  // Constructor
  Algorithms() :
    m_count(0)
  {
  }

  static Handle<Value> New(const Arguments& args)
  {
    HandleScope scope;
    Algorithms* hw = new Algorithms();
    hw->Wrap(args.This());
    return args.This();
  }

static Handle<Value> distance(const Arguments& args)
  {
    HandleScope scope;
    //Algorithms* hw = ObjectWrap::Unwrap<Algorithms>(args.This());
    
    Local<Value> arg0 = args[0];
    Local<Value> arg1 = args[1];
    Local<Value> arg2 = args[2];
    Local<Value> arg3 = args[3];

    double nLat1 = arg0->NumberValue();
    double nLon1 = arg1->NumberValue();
    double nLat2 = arg2->NumberValue();
    double nLon2 = arg3->NumberValue();

    double nRadius = 6371; // Earth's radius in Kilometers
    // Get the difference between our two points
    // then convert the difference into radians
 
    double nDLat = (nLat2 - nLat1) * (3.1415926535 / 180);
    double nDLon = (nLon2 - nLon1) * (3.1415926535 / 180);

    double nA = pow ( sin(nDLat/2), 2 ) + cos(nLat1) * cos(nLat2) * pow ( sin(nDLon/2), 2 );
 
    double nC = 2 * atan2( sqrt(nA), sqrt( 1 - nA ));
    double nD = nRadius * nC;
    Local<Number> result = Number::New(nD);
    return scope.Close(result);
  }

  /*
    Determines if a coordinate lies within a rectangle
	
	Use:		in_rectangle(findLat, findLong, topLeftLat, topLeftLong, botRightLat, botRightLong)
	Return:		1 if the first coordinate lies within the rectangle, otherwise 0
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
    int isWithinRect = 1;

    // Computations
    if (dFindLat > dTopLeftLat || dFindLong < dTopLeftLong || dFindLat < dBotRightLat || dFindLong > dBotRightLong)
    {
      isWithinRect = 0;
    }
	
    // Returning the result
    Local<Number> result = Number::New(isWithinRect);
    return scope.Close(result);
  }

  
};

Persistent<FunctionTemplate> Algorithms::s_ct;

// Initalizes and creates the Algorithms module
extern "C" {
  static void init (Handle<Object> target)
  {
    Algorithms::Init(target);
  }

  NODE_MODULE(Algorithms, init);
}
