Game.Init("canvas", "auto", "auto", 60, MAIN, GameLoop, Render, {}, {}, []);

///////////

var GameObjects = {};
GameObjects.bullets = [];

var playerSpeed = 3;
GameObjects.player1 = {
	score:0,
	x:100,
	y:300,
	size:20,
	moveSpeed:playerSpeed,
	texture:RGB(0,0,255),
	block:false,
	fire:function() {
		if(!GameObjects.player1.block) fireBullet("player1", "player2");
	}
};
GameObjects.player2 = {
	score:0,
	x:400,
	y:100,
	size:20,
	moveSpeed:playerSpeed,
	texture:RGB(255,0,0),
	block:false,
	fire:function() {
		if(!GameObjects.player2.block) fireBullet("player2", "player1");
	}
};

function fireBullet(source, target) {
	var src = GameObjects[source];
	var trg = GameObjects[target];
	var speed = 500;
	GameObjects.bullets.push({
		source:source,
		target:target,
		x:src.x,
		y:src.y,
		size:5,
		motion:new Vector(src.x, src.y, trg.x, trg.y).Normalize().Multiply(speed),
		moveSpeed:speed
	});
}

///////////

function MAIN() {
	var p1 = GameObjects.player1;
	var p2 = GameObjects.player2;

	Game.AttachEvent("p1up", "keypress", {button:"w", repeat:G.FpsToTime(60)}, function() {			p1.y-=p1.moveSpeed;});
	Game.AttachEvent("p1down", "keypress", {button:"s", repeat:G.FpsToTime(60)}, function() {		p1.y+=p1.moveSpeed;});
	Game.AttachEvent("p1left", "keypress", {button:"a", repeat:G.FpsToTime(60)}, function() {		p1.x-=p1.moveSpeed;});
	Game.AttachEvent("p1right", "keypress", {button:"d", repeat:G.FpsToTime(60)}, function() {		p1.x+=p1.moveSpeed;});
	Game.AttachEvent("p2up", "keypress", {button:"up", repeat:G.FpsToTime(60)}, function() {		p2.y-=p1.moveSpeed;});
	Game.AttachEvent("p2down", "keypress", {button:"down", repeat:G.FpsToTime(60)}, function() {	p2.y+=p1.moveSpeed;});
	Game.AttachEvent("p2left", "keypress", {button:"left", repeat:G.FpsToTime(60)}, function() {	p2.x-=p1.moveSpeed;});
	Game.AttachEvent("p2right", "keypress", {button:"right", repeat:G.FpsToTime(60)}, function() {	p2.x+=p1.moveSpeed;});

	Game.AttachEvent("p1fire", "keypress", {button:"e"}, p1.fire);
	Game.AttachEvent("p1block", "keypress", {button:"q"}, function() {p1.block = true}, function() {p1.block = false});
	Game.AttachEvent("p2fire", "keypress", {button:"ctrl"}, p2.fire);
	Game.AttachEvent("p2block", "keypress", {button:"num0"}, function() {p2.block = true;}, function() {p2.block = false;});

	Game.Start();
}

function GameLoop(t) {
	for(var i = 0; i<GameObjects.bullets.length; i++) {
		var bullet = GameObjects.bullets[i];
		if(bullet==undefined) continue;
		var trg = GameObjects[bullet.target];
		if(bullet.x<0 || bullet.x>Graphics.width || bullet.y<0 || bullet.y>Graphics.height) {
			GameObjects.bullets.delete(i, true);
		}
		else if(G.GetDist(bullet.x, bullet.y, trg.x, trg.y)<trg.size+bullet.size) {
			GameObjects.bullets.delete(i, true);
			if(!trg.block) GameObjects[bullet.source].score++;
		}
		else {
			bullet.x+=bullet.motion.x*t;
			bullet.y+=bullet.motion.y*t;
		}
	}
}

function Render() {
	var p1 = GameObjects.player1;
	var p2 = GameObjects.player2;

	Graphics.Draw({type:"circle", x:p1.x, y:p1.y, r:p1.size, texture:p1.texture, outlineTexture:p1.block?RGB(0,0,0):false, outlineWidth:5});
	Graphics.Draw({type:"circle", x:p2.x, y:p2.y, r:p2.size, texture:p2.texture, outlineTexture:p2.block?RGB(0,0,0):false, outlineWidth:5});

	for(var i = 0; i<GameObjects.bullets.length; i++) {
		var bullet = GameObjects.bullets[i];
		if(bullet==undefined) continue;
		Graphics.Draw({type:"circle", x:bullet.x, y:bullet.y, r:bullet.size, texture:RGB(200, 200, 0)});
	}
	
	Graphics.Draw({type:"text", text:p1.score, fontStyle:G.FontStyle(30, 0), texture:p1.texture, outlineTexture:RGB(0,0,0), outlineWidth:2, alignY:"top2", y:5, x:Graphics.canvasWidth/4});
	Graphics.Draw({type:"text", text:p2.score, fontStyle:G.FontStyle(30, 0), texture:p2.texture, outlineTexture:RGB(0,0,0), outlineWidth:2, alignY:"top2", y:5, x:3*Graphics.canvasWidth/4});
}