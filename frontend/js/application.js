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
            
            // Get user credentials
            // FIXME - This should be in the callback from joining a game
			// model.login();
            model.watchLocation();
		} else {
			$("#loading").html("Your device does not appear to support HTML5 geolocation");
		}
	}
};

/**
 * Model which handles server calls
 * 
 * @namespace model
 */
var model = {
		
	/**
	 * Facebook Connect authentication token
	 * FIXME - this is just a random UUID at the moment
	 */
	auth_token: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	}).toUpperCase(),
	
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
	
	// Get a session for the current user
	/*
	login: function() {
		// Do Facebook Connect magic here, and assign auth token to model.auth_token
	},
	*/
	
	/**
	 * Center map after the first load
	 */
	centerMap: function() {
		navigator.geolocation.getCurrentPosition(function(position) {
			map.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		}, function() {}, {
			maximumAge: 3000,
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
					$("#loading").html("Your location was not available. Please ensure that you have given permissions for geolocation.");
				},
				
				// Options
				{
					maximumAge: 1000,
					enableHighAccuracy: true
				}
			);
		
		} catch (e) {
			$("#loading").html("Browser did not report location.");
		}
	},
	
	/**
	 * Server call which updates your current location and gets
	 * the locations of all the other players
	 */
	updateLocation: function(position) {
		if (position.coords.accuracy < 30) {
			$("#loading").fadeOut('slow');
			$.ajax({
		        url: '/location/',
		        type: 'POST',
		        data: {
					user_id: model.auth_token,
		            latitude: position.coords.latitude,
		            longitude: position.coords.longitude,
		            accuracy: position.coords.accuracy
		        },
		        dataType: 'json',
		        success: function(data) {
		        	// Don't update if empty response from the server
		        	if (!data)
		        		return;
		        	
		        	model.players = data;
		        	
		        	// Update the locations of each player
		        	$.each(data, function(player_iterator, player) {
		        		if (model.player_markers[player_iterator] == undefined) {
		        			icon = player_iterator == model.auth_token ? "/css/images/star.png" : "/css/images/person.png";
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
		} else {
			$("#loading").show();
			$("#loading").html("Accuracy is still not acceptable (" + position.coords.accuracy + "m). <br />If this error persists, please ensure that your GPS radio is on.");
		}
	}
};

// Start application
$(document).ready(function() {
	map.initialize();
});
