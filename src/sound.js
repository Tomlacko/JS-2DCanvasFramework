var Sound = {
	Sounds:{}
};

//Preload sounds
Sound.PreloadSounds = function(callback, sounds) {
	var loadedSounds = 0;
	var numSounds = 0;
	for(var name in sounds) numSounds++;
	if(numSounds===0) {
		setTimeout(callback, 0);
		return;
	}
	for(var name in sounds) {
		var s = Sound.Sounds[name] = new Audio();
		s.oncanplaythrough = function() {
			if(++loadedSounds>=numSounds) setTimeout(callback, 0);
		};
		s.onerror = s.onabort = function() {
			//console.warn("Sound failed to load: \""+this.src+"\"");
			if(++loadedSounds>=numSounds) setTimeout(callback, 0);
		};
		s.src = sounds[name];
	}
};