var model;
var map;

/**
 * Map object which handles geolocation and mapping
 * 
 * @namespace map
 */
map = {
	/**
	 * Google maps object
	 */
	map: {},
	
	/**
	 * Info window for displaying information to the user
	 */
	infowindow: {},
	
	/**
	 * Map options
	 */
	options: {},
	
	/**
	 * Constructor, called upon page load
	 */
	initialize: function() {
		// Make street level map with no UI controls
		map.options = {
			zoom: 18,
            disableDefaultUI: true,
			mapTypeId: google.maps.MapTypeId.HYBRID
		};
		
		// Build infowindow
		map.infowindow = new google.maps.InfoWindow();
		
		// Check for geolocation support
		if (navigator.geolocation) {
			// Generate map and render on page
			map.map = new google.maps.Map(document.getElementById("map_canvas"), map.options);
			
			// Center map
			model.centerMap();
			
			// Watch the current location (lock onto GPS while user is reading the front page)
            model.watchLocation();
		} else {
			model.error("Your device does not appear to support HTML5 geolocation");
		}
	}
};

/**
 * Model which handles server calls
 * 
 * @namespace model
 */
model = {
		
	/**
	 * Facebook App ID
	 */
	app_id: 151829711542674,
	
	/**
	 * User information
	 */
	user: {},
	
	/**
	 * Array which holds the player objects
	 */
	players: {},
	
	/**
	 * Array which holds the player markers
	 */
	player_markers: {},
	
	/**
	 * Timer used for various polling activities
	 */
	timer: {},
	
	/**
	 * Initialize Facebook Connect login
	 */
	login: function() {
		FB.init({
			appId  : model.app_id,
			status : true, // check login status
			cookie : true, // enable cookies to allow the server to access the session
			xfbml  : true,  // parse XFBML
			popup: false
		});
		
		// Hook authentication into Facebook Connect
		FB.getLoginStatus(function(response) {
			  if (response.session) {
				  // user was already logged in
				  model.user.auth_token = response.session.access_token;
				  model.user.user_id = response.session.uid;
				  
				  FB.api('/me', function(response) {
				      model.user.name = response.name;
				  });
				  
				  model.login_successful();
			  } else {
				  // let user log in whenever they darn well please
			  }
		});
	},
	
	/**
	 * Log in as guest instead of using Facebook Connect
	 */
	guest_login: function() {
		model.user.auth_token = "guest";
		model.user.user_id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		}).toUpperCase();
		
		model.user.name = prompt("What is your name?");

		model.login_successful();
		return false;
	},
	
	/**
	 * Called after session is successfully retrieved
	 */
	login_successful: function() {
		try {
			window.location.hash = "#play";
		} catch (e) { }

		model.load_games();
	},
	
	/**
	 * Loads the list of games for the user to choose one
	 */
	load_games: function() {
	    $("#content").html('Loading games...');
	    var games = "";
	    model.fetch_games();
	    model.timer = setInterval(model.fetch_games, 5000);
	},
	
	/**
	 * Fetch games and populate list
	 */
	fetch_games: function() {
        $.ajax({
            type: 'GET',
            url: '/game/',
            cache: false,
            data: model.user,
            success: function(data) {
                $("#content").html('');
                if (data.length > 0) {
                    $.each(data, function(game_iterator, game) {
                        $("<a />").data('id', game)
                            .attr({'href': '#'})
                            .text(game)
                            .appendTo($("#content"));
                        $("<br />").appendTo($("#content"));
                    });
                    $("#content a").click(function() {
                        model.choose_game($(this).data('id'));
                        return false;
                    });
                } else {
                    $("<p />")
                        .text("There are no active games at the moment.")
                        .appendTo($("#content"));            
                }
                
                if (model.user.latitude && model.user.longitude) {
                    $("<a />").text("Create new game")
                        .attr({'href': '#'})
                        .click(function() {
                            model.create_game();
                            return false;
                        })
                        .appendTo($("#content"));
                } else {
                    $("<p />")
                        .text("Once we can determine your location, you'll be able to create a game.")
                        .appendTo($("#content"));
                }
            }
        });
	},
	
	/**
	 * Choose a game
	 */
	choose_game: function(game_id) {
	    // Stop refreshing game list
	    clearInterval(model.timer);
	    
	    // Choose game to join
	    model.user.game_id = game_id;
	    
	    // Watch the locations of the other players
        model.watchPlayers();
        
        // Clear overlay so gameplay can begin
	    $("#content").html('');
	    $("#overlay").fadeOut('slow');
	},
	
	/**
	 * Create a new game
	 */
	create_game: function() {
        $.ajax({
            type: 'POST',
            url: '/game/',
            data: model.user,
            success: function(data) {
                model.choose_game(model.user.name);
            }
        });
	},
	
	/**
	 * Something isn't right
	 */
	error: function(message) {
		$("#overlay").fadeIn();
		$(".error").show();
		$(".error").html(message);	
	},
	
	/**
	 * Center map after the first load
	 */
	centerMap: function() {
		navigator.geolocation.getCurrentPosition(function(position) {
			map.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		}, function() {}, {
			maximumAge: 500,
			enableHighAccuracy: true
		});
	},
	
	/**
	 * Center the user on their own location, and set up location listener
	 */
	watchLocation: function() {
		try {
			
			// Trigger update when position moves
			navigator.geolocation.watchPosition(
				// Success
				function(position) {
					model.updateLocation(position);
				}, 
				
				// Failure
				function(error) {
					model.error("Your location was not available: " + error.message);
				},
				
				// Options
				{
					maximumAge: 1000,
					enableHighAccuracy: true
				}
			);
		
		} catch (e) {
			model.error("Browser did not report location.");
		}
	},
	
	/**
	 * Get the locations of the other players
	 */
	watchPlayers: function() {
	    model.timer = setInterval(function() {
            $.ajax({
                url: '/location/',
                type: 'GET',
                data: {
                    game_id: model.user.game_id
                },
                cache: false,
                dataType: 'json',
                success: function(data) {
                    // Don't update if empty response from the server
                    if (!data) {
                        return;
                    }
         
                    // Copy the players array and delete your own coordinates
                    model.players = data;
                    delete model.players[model.user.user_id];
                    
                    // Update the locations of each player
                    $.each(model.players, function(player_iterator, player) {
                        if (model.player_markers[player_iterator] === undefined) {
                            icon = "/css/images/person.png";
                            model.player_markers[player_iterator] = new google.maps.Marker({
                                position: new google.maps.LatLng(player.latitude, player.longitude),
                                map: map.map,
                                title: player.name,
                                icon: icon
                            });
                            
                            google.maps.event.addListener(model.player_markers[player_iterator], 'click', function() {
                                map.infowindow.content = this.title;
                                map.infowindow.open(map.map, this);
                            });
                        } else {
                            model.player_markers[player_iterator].position = new google.maps.LatLng(player.latitude, player.longitude);
                        }
                    });
                }
            });
	    }, 3000);
	},
	
	/**
	 * Server call which updates your current location
	 */
	updateLocation: function(position) {
		// Update your location, regardless of whether it's in strict accuracy requirements
	    if (model.player_markers[model.user.user_id] === undefined) {
	        model.player_markers[model.user.user_id] = new google.maps.Marker({
                position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                map: map.map,
                title: "You",
                icon: "/css/images/star.png"
            });
	        
            google.maps.event.addListener(model.player_markers[model.user.user_id], 'click', function() {
                map.infowindow.content = this.title;
                map.infowindow.open(map.map, this);
            });
	    } else {
	        model.player_markers[model.user_id].position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	    }
	    
	    // Update the user's information
	    model.user.latitude = position.coords.latitude;
	    model.user.longitude = position.coords.longitude;
	    model.user.accuracy = position.coords.accuracy;
		
		// Update the server if strict requirements have been met
		if (/*position.coords.accuracy <= 30 && */model.user_id !== "" && model.game_id !== "") {
			$.ajax({
		        url: '/location/',
		        type: 'POST',
		        data: model.user,
		        dataType: 'json'
		    });
		}
	}
};

// Start application
$(document).ready(function() {
	$(".error").hide();
	$("#guest-login").click(model.guest_login);
	
	// Asynchronously load Facebook Connect js, then login
	$.getScript("http://connect.facebook.net/en_US/all.js", function() {
		model.login();
	});
	
	// In the background, lock onto the user's location
	map.initialize();
});
