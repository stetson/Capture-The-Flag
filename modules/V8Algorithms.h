#ifndef V8ALGORITHMS_H
#define V8ALGORITHMS_H

#include <v8.h>
#include <node.h>
#include <sstream>
#include <math.h>
#include <vector>
using namespace node;
using namespace v8;

class V8Algorithms: ObjectWrap
{

  private:
  
  public:
    static Persistent<FunctionTemplate> s_ct;
    static void Init(Handle<Object> target);
    static Handle<Value> New(const Arguments& args);
    static Handle<Value> distance_in_miles(const Arguments& args);
    static Handle<Value> in_rectangle(const Arguments& args);
    static Handle<Value> add_miles_to_coordinate(const Arguments& args);

};

#endif

