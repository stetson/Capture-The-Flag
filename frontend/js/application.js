/**
 * Map object which handles geolocation and mapping
 * 
 * @namespace map
 */
var map = {
	/**
	 * Google maps object
	 */
	map: {},
	
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
var model;
model = {
		
	/**
	 * Facebook App ID
	 */
	app_id: 151829711542674,
		
	/**
	 * Facebook Connect authentication token
	 */
	auth_token: "",
	
	/**
	 * Facebook id
	 */
	user_id: "",
	
	/**
	 * Conditions have been met for gameplay
	 */
	game_in_progress: false,
	
	/**
	 * Array which holds the player objects
	 */
	players: {},
	
	/**
	 * Array which holds the player markers
	 */
	player_markers: {},
	
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
				  model.auth_token = response.session.access_token;
				  model.user_id = response.session.uid;
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
		model.auth_token = "guest";
		model.user_id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		}).toUpperCase();

		model.login_successful();
		return false;
	},
	
	/**
	 * Called after session is successfully retrieved
	 */
	login_successful: function() {
		try {
			window.location.hash = "#play";
			window.location.search = "";
		} catch (e) { }

		$("#fb-root").hide();
		$("#loading").fadeOut("slow");
	},
	
	/**
	 * Something isn't right
	 */
	error: function(message) {
		$("#loading").fadeIn();
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
				function() {
					model.error("Your location was not available. Please ensure that you have given permissions for geolocation.");
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
	 * Server call which updates your current location and gets
	 * the locations of all the other players
	 */
	updateLocation: function(position) {
		// Update your location, regardless of whether it's in strict accuracy requirements
		model.player_markers[model.user_id].position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		
		// Update the server if strict requirements have been met
		if (position.coords.accuracy <= 30 && model.auth_token !== "") {
			$("#loading").fadeOut('slow');
			$.ajax({
		        url: '/location/',
		        type: 'POST',
		        data: {
					user_id: model.user_id,
					auth_token: model.auth_token,
		            latitude: position.coords.latitude,
		            longitude: position.coords.longitude,
		            accuracy: position.coords.accuracy
		        },
		        dataType: 'json',
		        success: function(data) {
		        	// Don't update if empty response from the server
		        	if (!data) {
		        		return;
		        	}

		        	model.players = data;

		        	// Update the locations of each player
		        	$.each(data, function(player_iterator, player) {
		        		if (model.player_markers[player_iterator] === undefined) {
		        			icon = player_iterator == model.user_id ? "/css/images/star.png" : "/css/images/person.png";
		        			model.player_markers[player_iterator] = new google.maps.Marker({
								position: new google.maps.LatLng(player.latitude, player.longitude),
								map: map.map,
								title: "Player " + player_iterator,
								icon: icon
							});
		        		} else {
		        			model.player_markers[player_iterator].position = new google.maps.LatLng(player.latitude, player.longitude);
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
