//define paths
var root = "projects/debug/"
var directory = {
	textures:root+"textures/",
	sounds:root+"sounds/",
	scripts:root+"scripts/"
};

var textures = {
	grid:"grid.png"
};
var sounds = {
	
};
var scripts = [
	
];

//prepend directory path
for(name in textures) textures[name] = directory.textures + textures[name];
for(name in sounds) sounds[name] = directory.sounds + sounds[name];
for(var i=0; i<scripts.length; i++) scripts[i] = directory.scripts + scripts[i] + ".js";

///////////

Game.Init("canvas", "auto", "auto", 20, MAIN, GameLoop, Render, textures, sounds, scripts);

//////////////////////////////////////////////////////////////////////////

var x=200, y=200, rot=0, dist=0, w=128, h=128;
var moveSpeed = 10;
var zoom = 1;
var cRot = 0;
var cx = 0, cy = 0;

function MAIN() {
	
	Game.AttachEvent("_up", "keypress", {button:"up", repeat:Game.tickSpeed}, function() {Graphics.MoveCanvasBy(0,-moveSpeed, true);});
	Game.AttachEvent("_down", "keypress", {button:"down", repeat:Game.tickSpeed}, function() {Graphics.MoveCanvasBy(0,moveSpeed, true);});
	Game.AttachEvent("_left", "keypress", {button:"left", repeat:Game.tickSpeed}, function() {Graphics.MoveCanvasBy(-moveSpeed, 0, true);});
	Game.AttachEvent("_right", "keypress", {button:"right", repeat:Game.tickSpeed}, function() {Graphics.MoveCanvasBy(moveSpeed, 0, true);});
	
	Game.AttachEvent("up", "keypress", {button:"w", repeat:Game.tickSpeed}, function() {y-=moveSpeed;});
	Game.AttachEvent("down", "keypress", {button:"s", repeat:Game.tickSpeed}, function() {y+=moveSpeed;});
	Game.AttachEvent("left", "keypress", {button:"a", repeat:Game.tickSpeed}, function() {x-=moveSpeed;});
	Game.AttachEvent("right", "keypress", {button:"d", repeat:Game.tickSpeed}, function() {x+=moveSpeed;});
	
	Game.AttachEvent("rotRight", "keypress", {button:"e", repeat:Game.tickSpeed}, function() {rot+=5});
	Game.AttachEvent("rotLeft", "keypress", {button:"q", repeat:Game.tickSpeed}, function() {rot-=5});
	Game.AttachEvent("dist+", "keypress", {button:"dot", repeat:Game.tickSpeed}, function() {dist+=5});
	Game.AttachEvent("dist-", "keypress", {button:"comma", repeat:Game.tickSpeed}, function() {dist-=5});
	
	Game.AttachEvent("cRotRight", "keypress", {button:"left bracket", repeat:Game.tickSpeed}, function() {cRot-=1});
	Game.AttachEvent("cRotLeft", "keypress", {button:"right bracket", repeat:Game.tickSpeed}, function() {cRot+=1});
	
	Game.AttachEvent("resizeX+", "keypress", {button:"num*", repeat:Game.tickSpeed}, function() {w+=5});
	Game.AttachEvent("resizeX-", "keypress", {button:"num/", repeat:Game.tickSpeed}, function() {w-=5});
	Game.AttachEvent("resizeY+", "keypress", {button:"num+", repeat:Game.tickSpeed}, function() {h+=5});
	Game.AttachEvent("resizeY-", "keypress", {button:"num-", repeat:Game.tickSpeed}, function() {h-=5});
	
	Game.AttachEvent("scrollTest", "mousescroll", {}, function(dir, e) {
		if(dir==="up") zoom*=1.1;
		else zoom/=1.1;
		Graphics.ZoomCanvasTo(Game.mouseX, Game.mouseY, zoom);
	});
	
	var drag = Game.AttachEvent("drag", "mousemove", {disabled:true}, function() {Graphics.MoveCanvasBy(Game.lastCursorX-Game.cursorX, Game.lastCursorY-Game.cursorY)});
	Game.AttachEvent("enableDrag", "mouseclick", {button:"left"}, function(){drag.Enable();}, function() {drag.Disable();});
	
	Graphics.AddBitmapAsTexture("random",
		Graphics.GenerateBitmap(128, 128, function(x, y) {
			return {
				r:Math.RandomRange(0,256),
				g:Math.RandomRange(0,256),
				b:Math.RandomRange(0,256),
				a:255
			};
		})
	);
	
	Graphics.AddBitmapAsTexture("mandelbrot",
		Graphics.GenerateBitmap(100, 100, function(x, y, width, height) {
			var midX = width/2;
			var midY = height/2;
			var maxiter = 4096;
			var colordiff = 4;
			var mZoom = 800;
			var offX = -0.5;
			var offY = 0;
			
			var x0 = (x-midX)/mZoom + offX;
			var y0 = (y-midY)/mZoom + offY;
			
			var a = 0;
			var b = 0;
			var rx = 0;
			var ry = 0;
			var c = 0;
			
			while((c < maxiter/colordiff) && (rx*rx + ry*ry <= 4)) {
				rx = a*a - b*b + x0;
				ry = 2*a*b + y0;
				a=rx;
				b=ry;
				c++;
			}
			
			var n = c*colordiff
			n = 255-Math.abs((256-(n%512)));
			var z = (c-1)/((maxiter/colordiff)-1);
			n = G.HSVtoRGB(z, n/255, n/255);
			return {r:n.r, g:n.g, b:n.g, a:255};
		})
	);
	
	Game.Start();
}

///////////

function GameLoop(t) {
	//console.log(Game.tick, t);
}

function Render() {
	//Graphics.RotateCanvas(cRot);
	//Graphics.Draw({type:"polygon", angle:a, x:b, y:0, centerX:50, centerY:0, points:[{x:0, y:0}, {x:200, y:0}, {x:0, y:200}], texture:Graphics.Textures["test"]});
	Graphics.Draw({type:"circle", x:0, y:0, r:10, texture:RGB(0,0,0)});
	//Graphics.Draw({type:"circle", angle:a, x:b, y:80, r:60, texture:Graphics.Textures["test"]});
	Graphics.Draw({type:"text", x:x, y:y+200, text:"Test", texture:"black", fontStyle:G.FontStyle(50), alignX:"middle", alignY:"middle"});
	//Graphics.Draw({type:"line", width:10, fromX:a, fromY:0, toX:b, toY:300, texture:Graphics.Textures["test"]});
	//var linePoint = G.PointAtAngle(Game.mouseX, Game.mouseY, w, 1000);
	//Graphics.Draw({type:"line", x1:Game.mouseX, y1:Game.mouseY, x2:linePoint.x, y2:linePoint.y, texture:"black"});
	for(var i=0.1; i<2; i+=0.1) Graphics.Draw({type:"circle", distance:Math.pow(2,i), x:Graphics.canvasWidth/2, y:Graphics.canvasHeight/2, r:5, texture:RGB(255,0,0), outline:RGB(0,0,0), outlineWidth:2});
	Graphics.Draw({type:"layer", texture:Graphics.Textures["grid"], distance:2, textureAngle:cRot, opacity:0.5});
	Graphics.Draw({type:"rect", angle:rot, distance:dist/100+1, x:x, y:y, width:w, height:h, outline:"black", outlineWidth:20, fillType:"stretch", texture:Graphics.Textures["grid"]});
	for(var i=0.1; i<10; i+=0.1) Graphics.Draw({type:"circle", distance:1/Math.pow(2,i), x:Graphics.canvasWidth/2, y:Graphics.canvasHeight/2, r:5, texture:RGB(255,0,0), outline:RGB(0,0,0), outlineWidth:2});
	Graphics.Draw({type:"image", angle:20, x:0, y:0, texture:Graphics.Textures.grid.img});
}