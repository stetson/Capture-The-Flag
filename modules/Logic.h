#ifndef LOGIC_H
#define LOGIC_H

#include <v8.h>
#include <node.h>
using namespace node;
using namespace v8;
class Logic: ObjectWrap
{

private:
  int m_count;
  
public:
  static Persistent<FunctionTemplate> s_ct;
  static void Init(Handle<Object> target);
  static Handle<Value> New(const Arguments& args);
  static Handle<Value> check_win(const Arguments& args);
  static Handle<Value> check_distance(const Arguments& args);
  static Handle<Value> check_flags(const Arguments& args);
  static Handle<Value> check_bounds(const Arguments& args);

  /**
   * Constructor for C++
   */
  Logic() { }

  ~Logic()
  {
  }

};

#endif
