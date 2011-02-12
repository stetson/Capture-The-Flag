/**
 * Map object which handles geolocation and mapping
 */
var map = {
	// Map object
	map: {},
	
	// Map options
	options: {},
	
	// Constructor
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
            
            // Get user credentials
            // FIXME - This should be in model.login();
            model.watchLocation();
            
			// Get rid of loading message once map is loaded
			// TODO - this will be replaced by login window
            google.maps.event.addListener(map.map, 'tilesloaded', function() {
                $("#loading").fadeOut('slow');
            });
		} else {
			alert("Your device does not appear to support HTML5 geolocation");
		}
	}
};

/**
 * Model which handles server calls
 */
var model = {
	username: "",
	password: "",
	uuid: "",
	
	// Conditions have been met for gameplay
	game_in_progress: false,
	
	// Array which holds the player objects
	players: {},
	
	// Array which holds the player markers
	player_markers: {},
	
	// Get a session for the current user
	/*
	login: function() {
		$.ajax({
			url: '/login/',
			type: 'POST',
			data: {
				'username': model.username,
				'password': model.password,
			},
			success: function(data, textStatus, jqXHR) {
				// Save UUID
				model.uuid = data.uuid;
				
				// Center the user on their own location, and set up location listener
				map.setCenter();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// TODO - handle this more gracefully
				alert("Authentication failed. Please try again. " + errorThrown);
			}
		});
	},
	*/
	
	// Center the user on their own location, and set up location listener
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
					alert("Your device has not given permission for HTML5 geolocation");
				},
				
				// Options
				{
					maximumAge: 3000,
					enableHighAccuracy: true
				}
			);
		
		} catch (e) {
			alert("Browser did not report location.");
		}
	},
	
	// Server call which updates your current location and gets
	// the locations of all the other players
	updateLocation: function(position) {
		//console.debug(position);
		// TODO - check for accuracy
		//if (position.coords.accuracy < 30) {
	    	// Center map on your new coordinates
			map.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

			$.ajax({
		        url: '/api/location/',
		        type: 'PUT',
		        data: {
					uuid: model.uuid,
		            latitude: position.coords.latitude,
		            longitude: position.coords.longitude
		        },
		        dataType: 'json',
		        success: function(data) {
		        	model.players = data;
		        	
		        	// Update the locations of each player
		        	$.each(data, function(player_iterator, player) {
		        		if (model.player_markers[player.id] == undefined) {
		        			model.player_markers[player.id] = new google.maps.Marker({
								position: new google.maps.LatLng(player.latitude, player.longitude),
								map: map.map,
								title: "Player " + player.id
							});
		        		} else {
		        			model.player_markers[player.id].position = new google.maps.LatLng(player.latitude, player.longitude);
		        		}
		        	});
		        }
		    });
		//} else {
		//	$("#loading").html("Accuracy is still not acceptable (" + position.coords.accuracy + "). <br />If this persists, please ensure that your GPS radio is on.");
		//}
	}
};

// Start application
$(document).ready(function() {
	map.initialize();
});