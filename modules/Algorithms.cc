#include <v8.h>
#include <node.h>
#include <sstream>
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
