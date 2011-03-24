#ifndef LOGIC_H
#define LOGIC_H

#include <v8.h>
#include <node.h>
using namespace node;
using namespace v8;
class Logic: ObjectWrap
{

public:
  static Persistent<FunctionTemplate> s_ct;
  static void Init(Handle<Object> target);
  static Handle<Value> New(const Arguments& args);
  static Handle<Value> run(const Arguments& args);
  static void check_win(const Local<Object>& game, const Local<Object>& player);
  static void check_distance(const Local<Object>& game, const Local<Object>& player1, const Local<Object>& player2);
  static void check_flags(const Local<Object>& game, const Local<Object>& player);
  static void check_bounds(const Local<Object>& game, const Local<Object>& player);

  // Constructor
  Logic()
  { }

  // Destructor
  ~Logic()
  { }

};

#endif
