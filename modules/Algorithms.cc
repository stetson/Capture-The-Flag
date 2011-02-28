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
    NODE_SET_PROTOTYPE_METHOD(s_ct, "add", add);
	NODE_SET_PROTOTYPE_METHOD(s_ct, "diff", diff);
  NODE_SET_PROTOTYPE_METHOD(s_ct, "distance", distance);

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

  static Handle<Value> add(const Arguments& args)
  {
    HandleScope scope;
    Algorithms* hw = ObjectWrap::Unwrap<Algorithms>(args.This());
    Local<Value> add = args[0];
    int i = hw->m_count;
    std::stringstream out;
    i = i + add->Int32Value();
    //hw->m_count = i;
    out << i;
    Local<String> result = String::New(out.str().c_str());
    //Local<String> result = String::New("Hello World");
    return scope.Close(result);
  }

static Handle<Value> distance(const Arguments& args)
  {
    HandleScope scope;
    Algorithms* hw = ObjectWrap::Unwrap<Algorithms>(args.This());
    
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
    Sample function. Gets the difference of two integers.
	Use		diff(int, int)
	Return	the difference between the first and second integer
  */  
  static Handle<Value> diff(const Arguments& args)
  {
  
    // Setting up the use of params
    HandleScope scope;
    std::stringstream out;
	
    // Grabbing our first two params (integers) and determining the type in c++
    Local<Value> first = args[0];
    Local<Value> second = args[1];
    int a = first->Int32Value();
    int b = second->Int32Value();
	
    // Computations
    int difference = a - b;
	
    // Returning the result
    out << difference;
    Local<String> result = String::New(out.str().c_str());
    return scope.Close(result);
  }

  /*
    (Not functioning at this time, needs more work.)
    Determines if a coordinate lies within a rectangle
	
	Use:		in_rectangle(coord, coord(x1), coord(y1), coord(x2), coord(y2))
	Return:		True if the first coordinate lies within the rectangle, otherwise false.
	Notes:		The first coordinate is the one we wish to know about, while the later four are the rectangle.
				This function assumes that the 4 coordinates provided are actually a rectangle or square!
  */  
  static Handle<Value> in_rectangle(const Arguments& args)
  {
  
    // Setting scope and building an string stream for output
    HandleScope scope;
    std::stringstream out;
	
    // Grabbing function parameters
    Local<Value> coord = args[0];
    Local<Value> rectX1 = args[1];
    Local<Value> rectY1 = args[2];
    Local<Value> rectX2 = args[3];
    Local<Value> rectY2 = args[4];
	
    // Computations
    // ...
	
    // Returning the result
    Local<String> result = String::New(out.str().c_str());
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
