var PROJECT_NAME = "test";
var root = "projects/"+PROJECT_NAME+"/";

var directory = {
	textures:root+"textures/",
	sounds:root+"sounds/",
	scripts:root+"scripts/"
};

////////////////////////////
//TEXTURES/////////////////

var textures = {
	//test:"test.png"
};
var sounds = {
	
};
var scripts = [
	
];

//prepend directory path
for(name in textures) textures[name] = directory.textures + textures[name];
for(name in sounds) sounds[name] = directory.sounds + sounds[name];
for(var i=0; i<scripts.length; i++) scripts[i] = directory.scripts + scripts[i] + ".js";
/////////////////////////////////

//canvas_name, width, height, fps, main_function, tick_function, render_function, textures, sounds, scripts
Game.Init("canvas", "auto", "auto", 60, Main, Tick, Render, textures, sounds, scripts);

//////////////////////////////////





var x = 200;
var y = 200;
var w = 10;
var h = 10;
var speed = 500




function Main() {
	//spacebar
	Game.AttachEvent("spacebar", "keypress", {button:"space", repeat:false}, function() {
		alert("spacebar");
	});
	
	//mouse click
	Game.AttachEvent("click", "mouseclick", {button:"left"}, function() {
		console.log(Game.mouseX, Game.mouseY);
	});
	
	Game.Start();
}




function Tick(time) {
	if(Input.KeyDown("w"))
		y-=speed*time;
	if(Input.KeyDown("a"))
		x-=speed*time;
	if(Input.KeyDown("s"))
		y+=speed*time;
	if(Input.KeyDown("d"))
		x+=speed*time;
	
}




function Render() {
	//texture:Graphics.Textures["test"]
	Graphics.Draw({type:"rect", x:x, y:y, width:w, height:h, color:"blue"});
}










