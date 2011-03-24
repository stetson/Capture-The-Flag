#include "Logic.h"
#include "Algorithms.h"

  void Logic::Init(Handle<Object> target)
  {
    HandleScope scope;

    Local<FunctionTemplate> t = FunctionTemplate::New(New);

    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("Logic"));

    NODE_SET_PROTOTYPE_METHOD(s_ct, "run", run);

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
   * Run all business logic
   *
   * @name run
   * @memberOf logic
   * @param game {Object} The game object
   * @function
   */
  Handle<Value> Logic::run(const Arguments& args)
  {
    HandleScope scope;
    Local<Object> game = Object::Cast(*args[0]);
    Local<Object> players = game->Get(String::New("players"))->ToObject();
    Local<Array> player_keys = players->GetPropertyNames();
    Local<Object> player1;
    Local<Object> player2;

    // Iterate over players
    for (unsigned int i = 0; i < player_keys->Length(); i++) {
      // Grab the player
      player1 = players->Get(player_keys->Get(i))->ToObject();

      // Run single-player business logic
      Logic::check_win(game, player1);

      // Cross-compare to the rest of the players
      for (unsigned int j = 0; j < player_keys->Length(); j++) {
        // Grab the player
        player2 = players->Get(player_keys->Get(j))->ToObject();
      }
    }

    return scope.Close(game);
  }

  /**
   * Check for a win
   *
   * @name check_win
   * @memberOf logic
   * @param game The game object
   * @param player The player to inspect
   * @function
   * @private
   */
  void Logic::check_win(const Local<Object>& game, const Local<Object>& player)
  {
    // Keys for accessing data members
    Local<String> latitude = String::New("latitude");
    Local<String> longitude = String::New("longitude");
    Local<String> has_flag = String::New("has_flag");

    // Local variables
    Local<String> team;
    Local<String> score;
    Local<String> bounds;
    Local<Object> top_left;
    Local<Object> bottom_right;

    // If they have the flag...
    if (player->Has(has_flag) && player->Get(has_flag)->ToBoolean()->Value()) {

      // Figure out which team they are on
      team = player->Get(String::New("team"))->ToString();
      bounds = String::Concat(team, String::New("_bounds"));

      // Grab the bounds for the player

      top_left = game->Get(bounds)->ToObject()->Get(String::New("top_left"))->ToObject();
      bottom_right = game->Get(bounds)->ToObject()->Get(String::New("bottom_right"))->ToObject();

      // ...And if they're in their own territory
      if (Algorithms::in_rectangle(player->Get(latitude)->NumberValue(), player->Get(longitude)->NumberValue(),
        top_left->Get(latitude)->NumberValue(), top_left->Get(longitude)->NumberValue(),
        bottom_right->Get(latitude)->NumberValue(), bottom_right->Get(longitude)->NumberValue())) {

        // Increment their team's score
        score = String::Concat(team, String::New("_score"));
        game->Set(score, Integer::New(game->Get(score)->IntegerValue() + 1));

        // Take the flag away from them
        player->Set(has_flag, Boolean::New(false));
      }
    }
  }

  /**
   * Check distances between players for tagging
   *
   * @name check_distance
   * @memberOf logic
   * @param game The game object
   * @param player1 The player to compare
   * @param player2 The player to compare
   * @function
   * @private
   */
  void Logic::check_distance(const Local<Object>& game, const Local<Object>& player1, const Local<Object>& player2)
  {
    // Check here
  }

  /**
   * Give the player the flag if they are within range of the flag
   *
   * @name check_flags
   * @memberOf logic
   * @param game The game object
   * @param player The player to inspect
   * @function
   * @private
   */
  void Logic::check_flags(const Local<Object>& game, const Local<Object>& player)
  {
    // Check here
  }

  
  /**
   * Check players for out of bounds, and place them in observer mode
   *
   * @name check_bounds
   * @memberOf logic
   * @param game The game object
   * @param player The player to inspect
   * @function
   * @private
   */
  void Logic::check_bounds(const Local<Object>& game, const Local<Object>& player)
  {
    // Check here
  }


Persistent<FunctionTemplate> Logic::s_ct;

extern "C" {
  static void init (Handle<Object> target)
  {
    Logic::Init(target);
  }

  NODE_MODULE(Logic, init);
}
