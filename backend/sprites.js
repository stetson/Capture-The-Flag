function change_location(user_id) {
	offset1 = (Math.random() - 0.5) / 10000;
	offset2 = (Math.random() - 0.5) / 10000;
	game_data[sprite_game].last_update = new Date();
    game_data[sprite_game].players[user_id] = {
        user_id: user_id,
        latitude: game_data[sprite_game].players[user_id].latitude + offset1,
        longitude: game_data[sprite_game].players[user_id].longitude + offset2
    };
    game_data[sprite_game].players[user_id].last_update = new Date();
}

exports.generate_sprites = function(number_of_sprites) {
    game_data[sprite_game] = {
            origin: {
            'latitude': 29.034559,
            'longitude': -81.302669
        },
        last_update: new Date(),
        players: {}
    };
    
	for (var x = 0; x < number_of_sprites; x++) {
		user_id = "Sprite " + x;
		game_data[sprite_game].players[user_id] = {};
		game_data[sprite_game].players[user_id].latitude = game_data[sprite_game].origin.latitude;
		game_data[sprite_game].players[user_id].longitude = game_data[sprite_game].origin.longitude;
	}
	
	setInterval(function() {
		for (var x = 0; x < number_of_sprites; x++) {
			user_id = "Sprite " + x;
			change_location(sprite_game, user_id);
		}
	}, 1000);
};