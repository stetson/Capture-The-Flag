var model;
var ui;

/**
 * Class which handles drawing of the user interface
 */
ui = {
    width: window.innerWidth ? window.innerWidth : document.body.offsetWidth,
    height: window.innerHeight ? window.innerHeight : document.body.offsetHeight,
    update: function() {
        if (model.game.origin !== undefined) {
            parameters = {
                size: ui.width + "x" + ui.height,
                center: model.game.origin.latitude + "," + model.game.origin.longitude,
                maptype: "satellite",
                markers: "color:gray|size:tiny|" + model.game.red_flag.latitude + "," + model.game.red_flag.longitude + "|" + model.game.blue_flag.latitude + "," + model.game.blue_flag.longitude,
                sensor: true
            };
            
            url = "http://maps.google.com/maps/api/staticmap?";
            for (parameter in parameters) {
                url += "&" + parameter + "=" + escape(parameters[parameter]);               
            }
            
            $("body").css({'background': "#000 url('" + url + "') 50% 50% no-repeat"});
        }
    },
    
    update_players: function(data) {
        $.each(data, function(player_iterator, player) {
            if (player.latitude) {
                if ($("#" + player_iterator).length === 0) {
                    icon = player_iterator == model.user.user_id ? "/css/images/star.png" : "/css/images/person_" + player.team + ".png";
                    $('<a href="#"></a>')
                        .attr({
                            'title': player.name,
                            'id': player_iterator
                        })
                        .click(function() { return false; })
                        .addClass("marker")
                        .css({
                            background: 'url("' + icon + '") 50% 50% no-repeat'
                        })
                        .appendTo($("body"));                
                }

                $("#" + player_iterator).css({
                    top: (
                        (
                            (
                                (
                                    (model.game.red_bounds.top_left.latitude + 180) - (1.0 * player.latitude + 180)
                                ) /
                                (
                                    (model.game.red_bounds.top_left.latitude + 180) - (model.game.blue_bounds.bottom_right.latitude + 180)
                                )
                            ) * ui.height
                        ) - 16).toFixed(0) + "px",         // Relative from latitude
                    left: (
                        (
                            (
                                (
                                    (model.game.blue_bounds.bottom_right.longitude + 180) - (1.0 * player.longitude + 180)
                                ) /
                                (
                                    (model.game.blue_bounds.bottom_right.longitude + 180) - (model.game.red_bounds.top_left.longitude + 180)
                                )
                            ) * ui.width
                        ) - 16).toFixed(0) + "px"        // Relative from longitude
                }); 
            }
        });
    }
};

/**
 * Model which handles server calls
 * 
 * @namespace model
 */
model = {
	
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
	 * Timer used for various polling activities
	 */
	timer: {},
	
	/**
	 * Log in as guest instead of using Facebook Connect
	 */
	login: function() {
		model.user.user_id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		}).toUpperCase();
		
		model.user.name = $('#login input[name="username"]').val();

		model.load_games();
		return false;
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
                            .addClass('button')
                            .text(game)
                            .appendTo($("#content"));
                        $("<br />").appendTo($("#content"));
                    });
                    $("#content a")
                    .click(function() {
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
                        .addClass('button')
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
                /*
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
                }).setMap(map.map);*/
                
                // Watch the locations of the other players
                model.watchPlayers();
                
                // Clear overlay so gameplay can begin
                $("#content").html('');
                $("body").empty();
                
                // Draw map
                ui.update();
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
	        name: model.user.name
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
		$("<p />").html(message).addClass('error').appendTo('body');	
	},
	
	/**
	 * Clear error
	 */
	clear_error: function() {
        $('.error').remove();	    
	},
	
	/**
	 * Center map after the first load
	 */
	centerMap: function(latitude, longitude, accuracy) {
		model.user.latitude = latitude;
		model.user.longitude = longitude;
		model.user.accuracy = accuracy;
		model.updateLocation(latitude, longitude, accuracy);
	},
	
	getLocation: function() {
		navigator.geolocation.getCurrentPosition(function(position) {
			model.centerMap(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
		}, function() {
			navigator.geolocation.getCurrentPosition(function(position) {
				model.centerMap(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
			}, function() {
                model.ipGetLocation();
			}, {
			    timeout: 3000
			});
		}, {
			maximumAge: 500,
			timeout: 3000,
			enableHighAccuracy: true
		});
	},
	
	ipGetLocation: function() {
        if (model.user.latitude === undefined && model.user.longitude == undefined) {
            $.getScript("http://j.maxmind.com/app/geoip.js", function() {
                model.clear_error();
                model.centerMap(geoip_latitude(), geoip_longitude(), 100000);
            });
        } else {
            model.centerMap(model.user.latitude, model.user.longitude, 100000);
        }  
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
		// Update the server if strict requirements have been met
		if (model.user.user_id !== undefined && model.user.game_id !== undefined) {
			$.ajax({
		        url: '/location/',
		        type: 'POST',
		        cache: false,
		        data: model.user,
		        dataType: 'json',
		        success: ui.update_players
		    });
		}
	}
};

// Start application
$(document).ready(function() {
    // Get name to log in with
    $("#login input[name='username']").focus();
	$("#login").submit(model.login);
	
	// In the background, lock onto the user's location
	model.getLocation();
});
