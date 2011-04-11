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
            disableDefaultUI: false,
            zoomControl: false,
            panControl: false,
            streetViewControl: false,
			mapTypeId: google.maps.MapTypeId.HYBRID
		};
		
		// Build infowindow
		map.infowindow = new google.maps.InfoWindow();
		
		// Check for geolocation support
		if (navigator.geolocation) {
			// Generate map and render on page
			map.map = new google.maps.Map(document.getElementById("map_canvas"), map.options);
			
			// Center map
			model.getLocation();
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
	 * Game information
	 */
	game: {},
	
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
		
		$("#toolbar a").click(function(){
		    try {
                model[$(this).attr('href').replace('#','')]();
		    } catch (e) { }
		    
		    return false;
        });

		model.load_games();
	},
	
	/**
	 * Is a button that when clicked should center on the user playing
	 */
	center_on_self: function() {
	    try {
	       map.map.setCenter(new google.maps.LatLng(model.user.latitude, model.user.longitude));
	    } catch (e) { }
	},
	
	/**
	 * Is a button that when clicked should center on the blue flag
	 */
	center_on_blue_flag: function() {
	    map.map.setCenter(new google.maps.LatLng(model.game.blue_flag.latitude, model.game.blue_flag.longitude));
	},
	
	/**
	 * Is a button that when clicked should center on the red flag
	 */
	center_on_red_flag: function() {
        map.map.setCenter(new google.maps.LatLng(model.game.red_flag.latitude, model.game.red_flag.longitude));
	},
	
	show_signal_strength: function(accuracy) {
	    // Determine which level accuracy falls within
	    // Change image on $("#signal_strength").css(backgroundImage: '');
	    // http://stackoverflow.com/questions/253689/switching-div-background-image-with-jquery
		if(accuracy < 10){
			$('#signal_strength').css("background-image", "/css/images/4bar.png");
		}
		else if(accuracy <= 30){ 
			$('#signal_strength').css("background-image", "/css/images/3Bar.png");
		}
		else if(accuracy <= 200){ 
			$('#signal_strength').css("background-image", "/css/images/2Bar.png");
		}
		else { 
			$('#signal_strength').css("background-image", "/css/images/1Bar.png");
		}
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
	    $.ajax({
	        url: '/game/' + game_id,
	        type: 'POST',
	        data: model.user,
	        success: function(data) {
                // Stop refreshing game list
                clearInterval(model.timer);

                // Choose game to join
                model.user.game_id = game_id;
                model.game = data;
                
                // Create markers for flags and draw bounds
                model.game.red_marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data.red_flag.latitude, data.red_flag.longitude),
                    map: map.map,
                    title: "Red flag",
                    icon: "/css/images/RedFlag.png"
                });
                model.game.blue_marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data.blue_flag.latitude, data.blue_flag.longitude),
                    map: map.map,
                    title: "Blue flag",
                    icon: "/css/images/BlueFlag.png"
                });
                model.game.red_territory = new google.maps.Polygon({
                    paths: [
                        new google.maps.LatLng(model.game.red_bounds.top_left.latitude, model.game.red_bounds.top_left.longitude),
                        new google.maps.LatLng(model.game.red_bounds.top_left.latitude, model.game.red_bounds.bottom_right.longitude),
                        new google.maps.LatLng(model.game.red_bounds.bottom_right.latitude, model.game.red_bounds.bottom_right.longitude),
                        new google.maps.LatLng(model.game.red_bounds.bottom_right.latitude, model.game.red_bounds.top_left.longitude)
                    ],
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.5,
                    fillColor: "#FF0000",
                    fillOpacity: 0.2
                }).setMap(map.map);
                model.game.blue_territory = new google.maps.Polygon({
                    paths: [
                        new google.maps.LatLng(model.game.blue_bounds.top_left.latitude, model.game.blue_bounds.top_left.longitude),
                        new google.maps.LatLng(model.game.blue_bounds.top_left.latitude, model.game.blue_bounds.bottom_right.longitude),
                        new google.maps.LatLng(model.game.blue_bounds.bottom_right.latitude, model.game.blue_bounds.bottom_right.longitude),
                        new google.maps.LatLng(model.game.blue_bounds.bottom_right.latitude, model.game.blue_bounds.top_left.longitude)
                    ],
                    strokeColor: "#0000FF",
                    strokeOpacity: 0.5,
                    fillColor: "#0000FF",
                    fillOpacity: 0.2
                }).setMap(map.map);

                // Watch the locations of the other players
                model.watchPlayers();

                // Clear overlay so gameplay can begin
                $("#content").html('');
                $("#overlay").fadeOut('slow');
            }
	    });
	},
	
	/**
	 * Create a new game
	 */
	create_game: function(game_id) {
	    var post_data = {
	        latitude: model.user.latitude,
	        longitude: model.user.longitude,
	        user_id: model.user.user_id
	    };
	    
	    if (game_id) {
	        post_data.game_id = game_id;
	    } else {
	        post_data.game_id = model.user.name;
	    }
	    
        $.ajax({
            type: 'POST',
            url: '/game/',
            data: post_data,
            success: function(data) {
                model.choose_game(post_data.game_id);
            },
            error: function() {
                var new_name = prompt("A game with your name is already reserved. Please enter a new name:");
                if (new_name) {
                    model.create_game(new_name);
                }
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
	 * Clear error
	 */
	clear_error: function() {
        $('.error').hide();	    
	},
	
	/**
	 * Center map after the first load
	 */
	centerMap: function(latitude, longitude, accuracy) {
		if (! map.map.getBounds()) {
			map.map.setCenter(new google.maps.LatLng(latitude, longitude));
		}
		
		model.user.latitude = latitude;
		model.user.longitude = longitude;
		model.user.accuracy = accuracy;
		model.show_signal_strength(accuracy);
		model.updateLocation(latitude, longitude, accuracy);
	},
	
	getLocation: function() {
		navigator.geolocation.getCurrentPosition(function(position) {
			model.centerMap(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
		}, function() {
			navigator.geolocation.getCurrentPosition(function(position) {
				model.centerMap(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
			}, function() {
				if (! model.user.latitude && ! model.user.longitude) {
					$.getScript("http://j.maxmind.com/app/geoip.js", function() {
						model.centerMap(geoip_latitude(), geoip_longitude(), 100000);
					});
				} else {
					model.centerMap(model.user.latitude, model.user.longitude, 100000);
				}
			});
		}, {
			maximumAge: 500,
			enableHighAccuracy: true
		});
	},
	
	/**
	 * Get the locations of the other players
	 */
	watchPlayers: function() {
	    model.timer = setInterval(model.getLocation, 1000);
	},
	
	/**
	 * Server call which updates your current location
	 */
	updateLocation: function(latitude, longitude, accuracy) {
	    // Update your location, regardless of whether it's in strict accuracy requirements
	    if (model.player_markers[model.user.user_id] !== undefined) {
	        model.player_markers[model.user.user_id].setPosition( new google.maps.LatLng(latitude, longitude) );
	    }
		
		// Update the server if strict requirements have been met
		if (model.user.user_id !== undefined && model.user.game_id !== undefined) {
			$.ajax({
		        url: '/location/',
		        type: 'POST',
		        cache: false,
		        data: model.user,
		        dataType: 'json',
		        success: function(data) {
	                // Don't update if empty response from the server
	                if (!data) {
	                    return;
	                }
	                
	                // Update the locations of each player
	                $.each(data, function(player_iterator, player) {
	                    if (model.player_markers[player_iterator] === undefined) {
	                    	if (model.timer){
	                    		model.player_markers.setVisible(false);
	                    	}
	                    	icon = player_iterator == model.user.user_id ? "/css/images/star.png" : "/css/images/person_" + player.team + ".png";
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
	                        model.player_markers[player_iterator].setPosition( new google.maps.LatLng(player.latitude, player.longitude) );
	                    }
	                });
				}
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
