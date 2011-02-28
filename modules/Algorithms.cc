/* This code is PUBLIC DOMAIN, and is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND. See the accompanying 
 * LICENSE file.
 */
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

    NODE_SET_PROTOTYPE_METHOD(s_ct, "add", add);

    target->Set(String::NewSymbol("Algorithms"),
                s_ct->GetFunction());
  }

  Algorithms() :
    m_count(0)
  {
  }

  ~Algorithms()
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

};

Persistent<FunctionTemplate> Algorithms::s_ct;

extern "C" {
  static void init (Handle<Object> target)
  {
    Algorithms::Init(target);
  }

  NODE_MODULE(Algorithms, init);
}
