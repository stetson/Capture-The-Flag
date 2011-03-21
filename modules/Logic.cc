#include "Logic.h"
#include "Algorithms.h"

  void Logic::Init(Handle<Object> target)
  {
    HandleScope scope;

    Local<FunctionTemplate> t = FunctionTemplate::New(New);

    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("Logic"));

    NODE_SET_PROTOTYPE_METHOD(s_ct, "check_win", check_win);
    NODE_SET_PROTOTYPE_METHOD(s_ct, "check_distance", check_distance);
    NODE_SET_PROTOTYPE_METHOD(s_ct, "check_flags", check_distance);
    NODE_SET_PROTOTYPE_METHOD(s_ct, "check_bounds", check_distance);

    target->Set(String::NewSymbol("Logic"),
                s_ct->GetFunction());
  }

  Handle<Value> Logic::New(const Arguments& args)
  {
    HandleScope scope;
    Logic* hw = new Logic();
    hw->Wrap(args.This());
    return args.This();
  }

  /**
   * Check for a win
   * @param game The game object
   */
  Handle<Value> Logic::check_win(const Arguments& args)
  {
    HandleScope scope;
    Local<Object> game = Object::Cast(*args[0]);

    // Do stuff (game->Set() and game->Get())
    // http://marcorogers.com/blog/static/v8/doxygen/classv8_1_1Object.html

    return scope.Close(game);
  }

  /**
   * Check distances between players for tagging
   * @param game The game object
   */
  Handle<Value> Logic::check_distance(const Arguments& args)
  {
    HandleScope scope;
    Local<Object> game = Object::Cast(*args[0]);

        // http://marcorogers.com/blog/static/v8/doxygen/classv8_1_1Object.html
    
    return scope.Close(game);
  }

  /**
   * Check flags to see if one is captured
   * @param game The game object
   */
  Handle<Value> Logic::check_flags(const Arguments& args)
  {
    HandleScope scope;
    Local<Object> game = Object::Cast(*args[0]);

    // Do stuff (game->Set() and game->Get())
    /* Sorry, I had to comment out your code. The changes you made
     * caused build errors. Please try not to commit code that breaks
     * builds! Check out the README.txt file if you don't know how to build modules :)
     * - Jeremy
		game->Set(bool isCaptured)
		{
		  bool isCaptured = false;
		 
		  if ((model.user.latitude, model.user.longitude) == (flag.latitude, flag.longitude))
		  {
			isCapture = true;
		  } 
		  
		}

		game->Get()
		{
			return this->isCaptured;
		}
	}
    */
  
  
    // http://marcorogers.com/blog/static/v8/doxygen/classv8_1_1Object.html

    return scope.Close(game);
  }

  
  /**
   * Check players for out of bounds, and place them in observer mode
   * @param game The game object
   */
  Handle<Value> Logic::check_bounds(const Arguments& args)
  {
    HandleScope scope;
    Local<Object> game = Object::Cast(*args[0]);

    // Do stuff (game->Set() and game->Get())
    // http://marcorogers.com/blog/static/v8/doxygen/classv8_1_1Object.html
	
	/*	game->Set(bool isInBounds)
	
			isInBounds = true;
	
		int playerSize = game->players[].size();
			for(i=0; i<playerSize; i++)
			{
				if(!in_rectangle(game->players[i].latitude, game->players[i].longitude,
				game->red_bounds., game->red_bounds., game->blue_bounds., game->blue_bounds.))
				(
					send player[i] to observer mode
				)
			}
	*/
    return scope.Close(game);
  }


Persistent<FunctionTemplate> Logic::s_ct;

extern "C" {
  static void init (Handle<Object> target)
  {
    Logic::Init(target);
  }

  NODE_MODULE(Logic, init);
}
