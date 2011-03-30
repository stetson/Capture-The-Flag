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
    unsigned int number_of_players = player_keys->Length();

    // Iterate over players
    for (unsigned int i = 0; i < number_of_players; i++) {
      // Grab the player
      player1 = players->Get(player_keys->Get(i))->ToObject();

      // Run single-player business logic
      Logic::check_bounds(game, player1);
      Logic::check_flags(game, player1);
      Logic::check_win(game, player1);

      // Cross-compare to the rest of the players
      for (unsigned int j = 0; j < player_keys->Length(); j++) {
        if (i != j) {
          // Grab the player
          player2 = players->Get(player_keys->Get(j))->ToObject();

          // Run cross-player business logic
          Logic::check_distance(game, player1, player2);
        }
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

        // TODO - return the flag to its place
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
    // Keys for accessing data members
    Local<String> latitude = String::New("latitude");
    Local<String> longitude = String::New("longitude");
    Local<String> has_flag = String::New("has_flag");
    Local<String> team = String::New("team");
	Local<String> captured;


    Local<Object> red_bounds = game->Get(String::New("red_bounds"))->ToObject();
    Local<Object> blue_bounds = game->Get(String::New("blue_bounds"))->ToObject();

    // If players are on different teams
    if (player1->Get(team)->Equals(player2->Get(team)) == false) {
      // Find distance between players
      double distance = Algorithms::distance_in_miles(player1->Get(latitude)->NumberValue(), player1->Get(longitude)->NumberValue(),
          player2->Get(latitude)->NumberValue(), player2->Get(longitude)->NumberValue());

      // If distance in acceptable tolarance
      if (distance < TOLERANCE) {
        // Find out what territory each player is in
        Local<String> player1_territory;
        Local<String> player2_territory;

        // Find out what territory player 1 is in
        if (Algorithms::in_rectangle(
          player1->Get(latitude)->NumberValue(), player1->Get(longitude)->NumberValue(),
          red_bounds->Get(String::New("top_left"))->ToObject()->Get(latitude)->NumberValue(),
          red_bounds->Get(String::New("top_left"))->ToObject()->Get(longitude)->NumberValue(),
          red_bounds->Get(String::New("bottom_right"))->ToObject()->Get(latitude)->NumberValue(),
          red_bounds->Get(String::New("bottom_right"))->ToObject()->Get(longitude)->NumberValue()
          )) {
            player1_territory = String::New("red");
        } else if (Algorithms::in_rectangle(
          player1->Get(latitude)->NumberValue(), player1->Get(longitude)->NumberValue(),
          blue_bounds->Get(String::New("top_left"))->ToObject()->Get(latitude)->NumberValue(),
          blue_bounds->Get(String::New("top_left"))->ToObject()->Get(longitude)->NumberValue(),
          blue_bounds->Get(String::New("bottom_right"))->ToObject()->Get(latitude)->NumberValue(),
          blue_bounds->Get(String::New("bottom_right"))->ToObject()->Get(longitude)->NumberValue()
          )) {
            player1_territory = String::New("blue");
        } else {
          // Out of bounds, not worth proceeding
          return;
        }

        // Find out what territory player 2 is in
        if (Algorithms::in_rectangle(
          player2->Get(latitude)->NumberValue(), player2->Get(longitude)->NumberValue(),
          red_bounds->Get(String::New("top_left"))->ToObject()->Get(latitude)->NumberValue(),
          red_bounds->Get(String::New("top_left"))->ToObject()->Get(longitude)->NumberValue(),
          red_bounds->Get(String::New("bottom_right"))->ToObject()->Get(latitude)->NumberValue(),
          red_bounds->Get(String::New("bottom_right"))->ToObject()->Get(longitude)->NumberValue()
          )) {
            player2_territory = String::New("red");
        } else if (Algorithms::in_rectangle(
          player2->Get(latitude)->NumberValue(), player2->Get(longitude)->NumberValue(),
          blue_bounds->Get(String::New("top_left"))->ToObject()->Get(latitude)->NumberValue(),
          blue_bounds->Get(String::New("top_left"))->ToObject()->Get(longitude)->NumberValue(),
          blue_bounds->Get(String::New("bottom_right"))->ToObject()->Get(latitude)->NumberValue(),
          blue_bounds->Get(String::New("bottom_right"))->ToObject()->Get(longitude)->NumberValue()
          )) {
            player2_territory = String::New("blue");
        } else {
          // Out of bounds, not worth proceeding
          return;
        }

        // If both players are in the same territory
        if (player1_territory->Equals(player2_territory)) {

          // If player 1 is not in their own territory...
          if (player1_territory->Equals(player1->Get(String::New("team"))->ToString()) == false) {
            // ...place them in observer mode
            player1->Set(String::New("observer_mode"), Boolean::New(true));

            // TODO - if they have the flag
              // TODO - take it away from them
              // TODO - return it to its place
			 if (player->Get(has_flag == true))
			{ 
			   game->Set(captured, Boolean::New(false));
			}
			else
			}

          // If player 1 is not in their own territory...
          if (player2_territory->Equals(player2->Get(String::New("team"))->ToString()) == false) {
            // ...place them in observer mode
            player2->Set(String::New("observer_mode"), Boolean::New(true));

            // TODO - if they have the flag
              // TODO - take it away from them
              // TODO - return it to its place
			 if (player->Get(has_flag == true))
			{ 
			   game->Set(captured, Boolean::New(false));
			}
			else
			}

        }
      }
    }
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
     // Local Variables
    Local<Object> flag;
    Local<String> team;
	Local<String> captured;

    // Figure out which team they are on (whether blue or red)
    team = player->Get(String::New("team"))->ToString();

    // Keys for accessing data members
    Local<String> latitude = String::New("latitude");
    Local<String> longitude = String::New("longitude");

    // For red team capture blue flag, for blue team capture red flag
    if (team->Equals(String::New("red")))
    {
      flag = game->Get(String::New("blue_flag"))->ToObject();
      captured = String::New("blue_flag_captured");
    }
    else
    {
      flag = game->Get(String::New("red_flag"))->ToObject();
      captured = String::New("red_flag_captured");
    }

    // Check to see if player's distance is less then the tolerance of the
    // flags and if it is then give the player the opposite team's flag
    if (Algorithms::distance_in_miles(
        player->Get(latitude)->NumberValue(), player->Get(longitude)->NumberValue(),
        flag->Get(latitude)->NumberValue(), flag->Get(longitude)->NumberValue())
      < TOLERANCE)
    {
      // Give player the flag
      player->Set(String::New("has_flag"), Boolean::New(true));

      // Remove the flag from its place
      game->Set(captured, Boolean::New(true));
    }
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
    // Keys for accessing data members
    Local<String> latitude = String::New("latitude");
    Local<String> longitude = String::New("longitude");
    Local<String> has_flag = String::New("has_flag");
    Local<String> team = player->Get(String::New("team"))->ToString();
	
    // Grab the bounds for the whole field
    Local<Object> field_top_left = game->Get(String::New("red_bounds"))->ToObject()->Get(String::New("top_left"))->ToObject();
    Local<Object> field_bottom_right = game->Get(String::New("blue_bounds"))->ToObject()->Get(String::New("bottom_right"))->ToObject();

    // Grab the bounds for the player's team
    Local<Object> team_top_left = game->Get(String::Concat(team, String::New("_bounds")))->ToObject()->Get(String::New("top_left"))->ToObject();
    Local<Object> team_bottom_right = game->Get(String::Concat(team, String::New("_bounds")))->ToObject()->Get(String::New("bottom_right"))->ToObject();
	
    // If person in game bounds
    if (! Algorithms::in_rectangle(
        player->Get(latitude)->NumberValue(), player->Get(longitude)->NumberValue(),
        field_top_left->Get(latitude)->NumberValue(), field_top_left->Get(longitude)->NumberValue(),
        field_bottom_right->Get(latitude)->NumberValue(), field_bottom_right->Get(longitude)->NumberValue()))
    {
      //If person has flag
      if (player->Has(has_flag) && player->Get(has_flag)->ToBoolean()->Value())
      {
        // Take the flag away from them
        player->Set(has_flag, Boolean::New(false));

        // TODO - Return the flag to its place
      }

      // Place the player in observer mode
      player->Set(String::New("observer_mode"), Boolean::New(true));
    }

    // If person is in their own bounds
    if (Algorithms::in_rectangle(
        player->Get(latitude)->NumberValue(), player->Get(longitude)->NumberValue(),
        team_top_left->Get(latitude)->NumberValue(), team_top_left->Get(longitude)->NumberValue(),
        team_bottom_right->Get(latitude)->NumberValue(), team_bottom_right->Get(longitude)->NumberValue()))
    {
      // Set observer mode to false
      player->Set(String::New("observer_mode"), Boolean::New(false));
    }
  }


Persistent<FunctionTemplate> Logic::s_ct;

extern "C" {
  static void init (Handle<Object> target)
  {
    Logic::Init(target);
  }

  NODE_MODULE(Logic, init);
}
