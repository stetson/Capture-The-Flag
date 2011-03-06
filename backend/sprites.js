function change_location(game_id, user_id) {
	offset1 = (Math.random() - 0.5) / 10000;
	offset2 = (Math.random() - 0.5) / 10000;
    game_data[game_id].last_update = new Date();
    game_data[game_id].players[user_id] = {
    	user_id: user_id,
    	latitude: game_data[game_id].players[user_id].latitude + offset1,
    	longitude: game_data[game_id].players[user_id].longitude + offset2
    };
    game_data[game_id].players[user_id].last_update = new Date();
}

exports.generate_sprites = function(game_id, number_of_sprites) {
	for (var x = 0; x < number_of_sprites; x++) {
		user_id = "Sprite " + x;
		game_data[game_id].players[user_id] = {};
		game_data[game_id].players[user_id].latitude = game_data[game_id].origin.latitude;
		game_data[game_id].players[user_id].longitude = game_data[game_id].origin.longitude;
	}
	
	setInterval(function() {
		for (var x = 0; x < number_of_sprites; x++) {
			user_id = "Sprite " + x;
			change_location(game_id, user_id);
		}
	}, 1000);
};