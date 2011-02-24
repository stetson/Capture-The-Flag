/* This code is PUBLIC DOMAIN, and is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND. See the accompanying 
 * LICENSE file.
 */

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
  static void Init(Handle<Object> target)
  {
    HandleScope scope;

    Local<FunctionTemplate> t = FunctionTemplate::New(New);

    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("Logic"));

    NODE_SET_PROTOTYPE_METHOD(s_ct, "getworld", getWorld);

    target->Set(String::NewSymbol("Logic"),
                s_ct->GetFunction());
  }

  Logic() :
    m_count(0)
  {
  }

  ~Logic()
  {
  }

  static Handle<Value> New(const Arguments& args)
  {
    HandleScope scope;
    Logic* hw = new Logic();
    hw->Wrap(args.This());
    return args.This();
  }

  static Handle<Value> getWorld(const Arguments& args)
  {
    HandleScope scope;
    Logic* hw = ObjectWrap::Unwrap<Logic>(args.This());
    hw->m_count++;
    Local<String> result = String::New("Hello World");
    return scope.Close(result);
  }

};

Persistent<FunctionTemplate> Logic::s_ct;

extern "C" {
  static void init (Handle<Object> target)
  {
    Logic::Init(target);
  }

  NODE_MODULE(Logic, init);
}
