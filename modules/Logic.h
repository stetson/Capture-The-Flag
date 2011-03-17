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
  static Handle<Value> getWorld(const Arguments& args);

  /**
   * Constructor for C++
   */
  Logic() :
    m_count(0)
  {
  }

  ~Logic()
  {
  }

};

#endif
