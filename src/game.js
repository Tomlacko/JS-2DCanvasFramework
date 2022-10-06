var Game = {
	cursorX:0,
	cursorY:0,
	mouseX:0,
	mouseY:0,
	lastCursorX:0,
	lastCursorY:0,
	lastMouseX:0,
	lastMouseY:0,
	mousePosEvent:null,
	tickSpeed:null,
	fps:null,
	tick:0,
	tickTime:null,
	lastTick:null,
	newTick:null,
	paused:true,
	timerID:null,
	timeScale:1,
	Events:{}
};

//MAIN INITIALIZATION
Game.Init = function(canvasID, width, height, maxFPS, callback, gameLoopFunc, renderFunc, textures, sounds, scripts) {
	//set values
	Game.tickSpeed = 1000/maxFPS;
	Game.fps = maxFPS;
	Game.Loop = gameLoopFunc;
	
	//replace placeholder function
	Graphics.RenderFunc = renderFunc;
	Graphics.Render = function() {
		Graphics.ClearCanvas();
		Graphics.RenderFunc();
	};
	
	//all-loaded callback
	var texturesLoaded = false;
	var soundsLoaded = false;
	var scriptsLoaded = false;
	function checkAllLoaded() {
		if(texturesLoaded && soundsLoaded && scriptsLoaded) setTimeout(callback, 0);
	}
	
	//set canvas size (resolution)
	if(Utils.ValidNum(width) && width > 0) Graphics.setWidth = Math.round(width);
	else Graphics.setWidth = false;
	if(Utils.ValidNum(height) && height > 0) Graphics.setHeight = Math.round(height);
	else Graphics.setHeight = false;
	
	//init canvas, textures & sounds
	Graphics.InitCanvas(canvasID);
	
	if(textures!=undefined) Graphics.PreloadTextures(function() {
		texturesLoaded = true;
		checkAllLoaded();
	}, textures);
	else texturesLoaded = true;
	
	if(sounds!=undefined) Sound.PreloadSounds(function() {
		soundsLoaded = true;
		checkAllLoaded();
	}, sounds);
	else soundsLoaded = true;
	
	if(scripts!=undefined) G.PreloadScripts(function() {
		scriptsLoaded = true;
		checkAllLoaded();
	}, scripts);
	else scriptsLoaded = true;
	
	Game.mousePosEvent = new Input.Event.MouseMove({}, function(x, y) {
		var BB = canvas.getBoundingClientRect();
		
		Game.lastCursorX = Game.cursorX;
		Game.lastCursorY = Game.cursorY;
		Game.cursorX = x-BB.left;
		Game.cursorY = y-BB.top;
		
		Game.lastMouseX = Game.mouseX;
		Game.lastMouseY = Game.mouseY;
		Game.mouseX = Game.cursorX/Graphics.canvasZoom + Graphics.canvasX;
		Game.mouseY = Game.cursorY/Graphics.canvasZoom + Graphics.canvasY;
	});
	
	checkAllLoaded();
};

Game.MainLoop = function() {
	Game.timerID = setTimeout(Game.MainLoop, Game.tickSpeed);
	Game.tickTime = Game.lastTick.since();
	Game.newTick = new Timestamp();
	
	//prevents physics jump
	if(Game.tickTime>2000) Game.tickTime = Game.tickSpeed;
	
	Game.tickTime*=Game.timeScale;
	
	Game.Loop(Game.tickTime/1000);
	Graphics.Render();
	
	Game.tick++;
	Game.lastTick = Game.newTick;
};

Game.Start = function() {
	if(Game.paused) {
		Game.paused = false;
		Game.lastTick = new Timestamp();
		Game.timerID = setTimeout(Game.MainLoop, Game.tickSpeed);
		return true;
	}
	return false;
};

Game.Stop = function() {
	if(!Game.paused){
		clearTimeout(Game.timerID);
		Game.paused = true;
		return true;
	}
	return false;
};

Game.SetFPSLimit = function(fps) {
	Game.tickSpeed = 1000/fps;
	Game.fps = fps;
};

Game.AttachEvent = function(evName, type, event, callback, onstopCallback) {
	var name = Utils.FormatString(evName, false);
	if(name===false) throw "Invalid event name!";
	
	if(type==="mouseclick") var ev = Game.Events[name] = new Input.Event.MouseClick(event, callback, onstopCallback);
	else if(type==="mousemove") var ev = Game.Events[name] = new Input.Event.MouseMove(event, callback);
	else if(type==="mousescroll") var ev = Game.Events[name] = new Input.Event.MouseScroll(event, callback);
	else if(type==="keypress") var ev = Game.Events[name] = new Input.Event.KeyPress(event, callback, onstopCallback);
	else throw "Invalid event type!";
	return ev;
};