#ifndef ALGORITHMS_H
#define ALGORITHMS_H

// Earth's radius in Kilometers
#define EARTH_RADIUS 6371.009

// The estimated value of PI
#define PI 3.1415926535

// Miles to kilometer conversion factor
#define MILES_PER_KILOMETER 0.621371192

#include <v8.h>
#include <node.h>
#include <sstream>
#include <math.h>
#include <vector>
using namespace node;
using namespace v8;
class Algorithms: ObjectWrap
{

private:
  int m_count;
  
public:

  static Persistent<FunctionTemplate> s_ct;
  static void Init(Handle<Object> target);
  static Handle<Value> New(const Arguments& args);
  static Handle<Value> distance_in_miles(const Arguments& args);
  static Handle<Value> in_rectangle(const Arguments& args);
  static Handle<Value> add_miles_to_coordinate(const Arguments& args);

  /**
   * Constructor for C++
   */
  Algorithms() : m_count(0) { }



  ~Algorithms(){  }



};

#endif
