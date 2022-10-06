var PROJECT_NAME = "3D";
var root = "projects/"+PROJECT_NAME+"/";

var directory = {
	textures:root+"textures/",
	sounds:root+"sounds/",
	scripts:root+"scripts/"
};

////////////////////////////
//TEXTURES/////////////////

var textures = {
	
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


var scene = prompt("Choose scene:\n\ntest, deer, amnesia, empty", "test")
var options = {}
options.points = false//confirm("Option 1: Draw points?")
options.lines = true//confirm("Option 2: Draw lines?")
options.faces = true//confirm("Option 3: Draw faces?")
options.ids = false//confirm("Option 4: Draw vertex IDs?")
options.flying = true//confirm("Option 5: Flying?")
options.lgb = false//confirm("Option 6: Draw logicboard nodes?")


var fpsLabel = document.createElement("p");
fpsLabel.style = "font-size:18px; color:red; position:absolute; top:10px; left:10px; font-weight:bold;"
document.body.appendChild(fpsLabel)

var controlsLabel = document.createElement("p");
controlsLabel.innerHTML = "WASD: move<br>SPACE/SHIFT: up/down<br>SPACE: jump<br>MOUSE: look<br>NUM+/NUM-: movespeed<br>F: shoot<br>E: build<br>Q: delete"
controlsLabel.style = "font-size:18px; color:blue; position:absolute; top:10px; right:10px;"
document.body.appendChild(controlsLabel)


var opts = document.createElement("p");
opts.style = "font-size:14px; color:orange; text-shadow:1px 1px 2px white; position:absolute; top:50px; left:10px;"
opts.innerHTML = "<input type='checkbox' "+(options.points?"checked":"")+" onclick='options.points=!options.points'>Draw verticies?<br>"+
"<input type='checkbox' "+(options.lines?"checked":"")+" onclick='options.lines=!options.lines'>Draw lines?<br>"+
"<input type='checkbox' "+(options.faces?"checked":"")+" onclick='options.faces=!options.faces'>Draw faces?<br>"+
"<input type='checkbox' "+(options.ids?"checked":"")+" onclick='options.ids=!options.ids'>Draw vertex ID?<br>"+
"<input type='checkbox' "+(options.flying?"checked":"")+" onclick='options.flying=!options.flying'>Flying mode?<br>"+
"---<br>"+
"<input type='checkbox' onclick='Game.paused?Game.Start():Game.Stop()'>-PAUSE-"
document.body.appendChild(opts)

var objLabel = document.createElement("p");
objLabel.innerText = "Selected object: 0";
objLabel.style = "font-size:16px; color:lime; text-shadow:1px 1px 2px black; position:absolute; top:10px; left:300px; font-weight:bold;"
document.body.appendChild(objLabel)



var playerHeight = 2
var cam = {x:0, y:playerHeight, z:-10, rx:0, ry:0}
var mindist = 0.01

var motionY = 0;
var gravity = 25;

var walkspeed = 10
var sensitivity = 0.6

var reach = 4

var objptr = 0;

var timesum = 0;
var ticksum = 0;


var objects = [];

var floor = {
	points:[
		{x:-5,y:0,z:-5},
		{x:5,y:0,z:-5},
		{x:-5,y:0,z:5},
		{x:5,y:0,z:5}
	],
	lines:[
		{a:0, b:1},
		{a:0, b:2},
		{a:1, b:3},
		{a:2, b:3}
	],
	faces:[
		[0,1,3,2]
	]
};

if(scene==="amnesia") {
	(function(){
		var script = document.createElement("script");
		script.src = root+"objects/amnesia/room.js";
		document.head.appendChild(script);
	})()
	options.lines = false;
	opts.children[2].checked = false;
	options.flying = false;
	opts.children[8].checked = false;
	walkspeed = 2;
}

if(scene==="test") {
	options.flying = false;
	opts.children[8].checked = false;
	
	objects.push({
		points:[
			{x:-1, y:0, z:2},
			{x:1, y:0, z:2},
			{x:-1, y:0, z:4},
			{x:1, y:0, z:4},
			{x:-1, y:2, z:2},
			{x:1, y:2, z:2},
			{x:-1, y:2, z:4},
			{x:1, y:2, z:4}
		],
		lines:[
			{a:0, b:1},//0
			{a:0, b:4},
			{a:0, b:2},
			{a:1, b:5},//3
			{a:1, b:3},
			{a:2, b:3},
			{a:2, b:6},//6
			{a:3, b:7},
			{a:4, b:5},
			{a:4, b:6},//9
			{a:5, b:7},
			{a:6, b:7}
		],
		faces:[
			[2, 3, 7, 6],//back
			[0, 1, 3, 2],//bottom
			[4, 5, 7, 6],//top
			[0, 2, 6, 4],//left
			[1, 3, 7, 5],//right
			[0, 1, 5, 4]//front
		]
	});
	objects.push(floor);
}

var sprites = [];




function Main() {	
	var drag = Game.AttachEvent("drag", "mousemove", {disabled:true}, function() {
		cam.rx+=(Game.cursorX-Game.lastCursorX)*sensitivity;
		cam.ry+=(Game.cursorY-Game.lastCursorY)*sensitivity;
		cam.ry = Math.min(Math.max(cam.ry, -90), 90)
	});
	Game.AttachEvent("enableDrag", "mouseclick", {button:"left"}, function(){drag.Enable();}, function() {drag.Disable();});
	Game.AttachEvent("jump", "keypress", {button:"space", repeat:false}, function(){
		if(options.flying || cam.y>playerHeight+0.01) return;
		cam.y=playerHeight+0.1
		motionY=10
	});
	Game.AttachEvent("shoot", "keypress", {button:"f", repeat:200}, function(){
		sprites.push({x:cam.x, y:cam.y, z:cam.z, rx:cam.rx, ry:cam.ry, type:"bullet", size:0.2, speed:15, life:0, max_life:5, color:RGB(Math.RandomRange(0,256),Math.RandomRange(0,256),Math.RandomRange(0,256))});
	});
	Game.AttachEvent("build", "keypress", {button:"e", repeat:false}, function(){
		var rx = Math.toRad(cam.rx)
		var ry = Math.toRad(cam.ry)
		var z = Math.round((cam.z+reach*Math.cos(rx)*Math.cos(ry))/2)*2
		var x = Math.round((cam.x+reach*Math.sin(rx)*Math.cos(ry))/2)*2
		var y = Math.round((cam.y-reach*Math.sin(ry))/2)*2
		objects.push({
			points:[
			{x:x-1, y:y-1, z:z-1},
			{x:x+1, y:y-1, z:z-1},
			{x:x-1, y:y-1, z:z+1},
			{x:x+1, y:y-1, z:z+1},
			{x:x-1, y:y+1, z:z-1},
			{x:x+1, y:y+1, z:z-1},
			{x:x-1, y:y+1, z:z+1},
			{x:x+1, y:y+1, z:z+1}
		],
		lines:[{a:0, b:1},{a:0, b:4},{a:0, b:2},{a:1, b:5},{a:1, b:3},{a:2, b:3},{a:2, b:6},{a:3, b:7},{a:4, b:5},{a:4, b:6},{a:5, b:7},{a:6, b:7}],faces:[[2, 3, 7, 6],[0, 1, 3, 2],[4, 5, 7, 6],[0, 2, 6, 4],[1, 3, 7, 5],[0, 1, 5, 4]]
		})
		objptr = objects.length-1
	});
	Game.AttachEvent("undo", "keypress", {button:"q", repeat:false}, function(){
		objects.splice(objptr,1);
		objptr = objects.length-1
	});
	
	//walkspeed
	Game.AttachEvent("num+", "keypress", {button:"num+", repeat:false}, function(){
		walkspeed*=1.5
	});
	Game.AttachEvent("num-", "keypress", {button:"num-", repeat:false}, function(){
		walkspeed/=1.5
	});
	
	//scroll through objects
	Game.AttachEvent("r", "keypress", {button:"num*", repeat:false}, function(){
		objptr = (objptr+1)%objects.length
	});
	Game.AttachEvent("l", "keypress", {button:"num/", repeat:false}, function(){
		objptr = objptr-1
		if(objptr<0) objptr = objects.length-1
	});
	
	//moving
	Game.AttachEvent("num8", "keypress", {button:"num8", repeat:200}, function(){
		moveObj(0.5*Math.round(Math.sin(Math.toRad(cam.rx))), 0, 0.5*Math.round(Math.cos(Math.toRad(cam.rx))), objects[objptr]);
	});
	Game.AttachEvent("num2", "keypress", {button:"num2", repeat:200}, function(){
		moveObj(-0.5*Math.round(Math.sin(Math.toRad(cam.rx))), 0, -0.5*Math.round(Math.cos(Math.toRad(cam.rx))), objects[objptr]);
	});
	Game.AttachEvent("num6", "keypress", {button:"num6", repeat:200}, function(){
		moveObj(0.5*Math.round(Math.cos(Math.toRad(cam.rx))), 0, -0.5*Math.round(Math.sin(Math.toRad(cam.rx))), objects[objptr]);
	});
	Game.AttachEvent("num4", "keypress", {button:"num4", repeat:200}, function(){
		moveObj(-0.5*Math.round(Math.cos(Math.toRad(cam.rx))), 0, 0.5*Math.round(Math.sin(Math.toRad(cam.rx))), objects[objptr]);
	});
	Game.AttachEvent("num7", "keypress", {button:"num7", repeat:200}, function(){
		moveObj(0, 0.5, 0, objects[objptr]);
	});
	Game.AttachEvent("num1", "keypress", {button:"num1", repeat:200}, function(){
		moveObj(0, -0.5, 0, objects[objptr]);
	});
	
	//scaling
	Game.AttachEvent("num9", "keypress", {button:"num9", repeat:false}, function(){
		scaleObj(2, objects[objptr])
	});
	Game.AttachEvent("num3", "keypress", {button:"num3", repeat:false}, function(){
		scaleObj(0.5, objects[objptr])
	});
	
	//rotating
	Game.AttachEvent("insert", "keypress", {button:"insert", repeat:200}, function(){
		rotateObjX(22.5, objects[objptr])
	});
	Game.AttachEvent("delete", "keypress", {button:"delete", repeat:200}, function(){
		rotateObjX(-22.5, objects[objptr])
	});
	Game.AttachEvent("home", "keypress", {button:"home", repeat:200}, function(){
		rotateObjY(22.5, objects[objptr])
	});
	Game.AttachEvent("end", "keypress", {button:"end", repeat:200}, function(){
		rotateObjY(-22.5, objects[objptr])
	});
	Game.AttachEvent("page_up", "keypress", {button:"pageup", repeat:200}, function(){
		rotateObjZ(22.5, objects[objptr])
	});
	Game.AttachEvent("page_down", "keypress", {button:"pagedown", repeat:200}, function(){
		rotateObjZ(-22.5, objects[objptr])
	});
	
	//duplicate
	Game.AttachEvent("num5", "keypress", {button:"num5", repeat:false}, function(){
		objects.push(JSON.parse(JSON.stringify(objects[objptr])))
		objptr = objects.length-1;
	});
	
	Game.Start();
}

function moveObj(dx, dy, dz, obj) {
	var p;
	for(var i=0; i<obj.points.length; i++) {
		p = obj.points[i]
		p.x+=dx;
		p.y+=dy;
		p.z+=dz;
	}
	return obj
}

function getObjMid(obj) {
	var p;
	var x = 0;
	var y = 0;
	var z = 0;
	for(var i=0; i<obj.points.length; i++) {
		p = obj.points[i]
		x+=p.x;
		y+=p.y;
		z+=p.z;
	}
	var l = obj.points.length;
	return {x:x/l, y:y/l, z:z/l};
}

function scaleObj(s, obj) {
	var p;
	var m = getObjMid(obj);
	for(var i=0; i<obj.points.length; i++) {
		p = obj.points[i]
		p.x=m.x+(p.x-m.x)*s;
		p.y=m.y+(p.y-m.y)*s;
		p.z=m.z+(p.z-m.z)*s;
	}
	return obj;
}

function rotateObjX(dr, obj) {
	var p, np, dist, angle;
	var m = getObjMid(obj);
	for(var i=0; i<obj.points.length; i++) {
		p = obj.points[i]
		dist = G.GetDist(m.y, m.z, p.y, p.z);
		angle = G.GetAngle(m.y, m.z, p.y, p.z);
		np = G.PointAtAngle(m.y, m.z, angle+dr, dist)
		p.y = np.x;
		p.z = np.y;
	}
	return obj
}

function rotateObjY(dr, obj) {
	var p, np, dist, angle;
	var m = getObjMid(obj);
	for(var i=0; i<obj.points.length; i++) {
		p = obj.points[i]
		dist = G.GetDist(m.x, m.z, p.x, p.z);
		angle = G.GetAngle(m.x, m.z, p.x, p.z);
		np = G.PointAtAngle(m.x, m.z, angle+dr, dist)
		p.x = np.x;
		p.z = np.y;
	}
	return obj
}

function rotateObjZ(dr, obj) {
	var p, np, dist, angle;
	var m = getObjMid(obj);
	for(var i=0; i<obj.points.length; i++) {
		p = obj.points[i]
		dist = G.GetDist(m.x, m.y, p.x, p.y);
		angle = G.GetAngle(m.x, m.y, p.x, p.y);
		np = G.PointAtAngle(m.x, m.y, angle+dr, dist)
		p.x = np.x;
		p.y = np.y;
	}
	return obj
}


function Tick(time) {
	var rx = Math.toRad(cam.rx)
	var ry = options.flying?Math.toRad(cam.ry):0;
	
	if(Input.KeyDown("w")) {
		cam.z+=walkspeed*time*Math.cos(rx)*Math.cos(ry)
		cam.x+=walkspeed*time*Math.sin(rx)*Math.cos(ry)
		if(options.flying) cam.y-=walkspeed*time*Math.sin(ry)
	}
	if(Input.KeyDown("a")) {
		cam.x-=walkspeed*time*Math.cos(rx)
		cam.z+=walkspeed*time*Math.sin(rx)
	}
	if(Input.KeyDown("s")) {
		cam.z-=walkspeed*time*Math.cos(rx)*Math.cos(ry)
		cam.x-=walkspeed*time*Math.sin(rx)*Math.cos(ry)
		if(options.flying) cam.y+=walkspeed*time*Math.sin(ry)
	}
	if(Input.KeyDown("d")) {
		cam.x+=walkspeed*time*Math.cos(rx)
		cam.z-=walkspeed*time*Math.sin(rx)
	}
	if(Input.KeyDown("space")) {
		if(options.flying) cam.y+=walkspeed*time
	}
	if(Input.KeyDown("shift")) {
		if(options.flying) cam.y-=walkspeed*time
	}
	
	
	//spawn particles
	if(scene==="test") {
		sprites.push({x:-5, y:0, z:5, type:"particle", size:0.05, mot:{x:Math.RandomRangeFloat(-6,9), y:Math.RandomRangeFloat(10,18), z:Math.RandomRangeFloat(-6,9)}, life:0, max_life:8, color:RGB(Math.RandomRange(0,256),Math.RandomRange(0,256),Math.RandomRange(0,256))});
	}
	
	
	for(var i=0; i<sprites.length; i++) {
		var sp = sprites[i];
		sp.life+=time;
		if(sp.life>=sp.max_life) {
			sprites.splice(i,1);
			i--;
			continue;
		}
		
		if(sp.type==="bullet") {
			var rx = Math.toRad(sp.rx)
			var ry = Math.toRad(sp.ry)
			sp.z+=sp.speed*time*Math.cos(rx)*Math.cos(ry)
			sp.x+=sp.speed*time*Math.sin(rx)*Math.cos(ry)
			sp.y-=sp.speed*time*Math.sin(ry)
			if(sp.y<=0 && sp.y>-0.3 && sp.x>-5 && sp.x<5 && sp.z<5 && sp.z>-5) {
				sp.ry*=-1
				sp.y=Math.abs(sp.y)
			}
		}
		else {
			sp.mot.y-=gravity*time;
			sp.mot.x*=0.992
			sp.mot.z*=0.992
			sp.x+=sp.mot.x*time;
			sp.y+=sp.mot.y*time;
			sp.z+=sp.mot.z*time;
			if(sp.y<=0 && sp.x>-5 && sp.x<5 && sp.z<5 && sp.z>-5) {
				if(Math.abs(sp.mot.y)<1) {
					sp.y = 0
					sp.mot.y = 0;
				}
				else {
					sp.y=Math.abs(sp.y)
					sp.mot.y*=-0.8
				}
			}
		}
	}
	
	if(!options.flying) {
		motionY-=gravity*time
		cam.y+=motionY*time
		if(cam.y<playerHeight) {
			cam.y = playerHeight;
			motionY=0;
		}
	}
	
	timesum+=time;
	ticksum++;
	if(timesum>=0.5) {
		fpsLabel.innerText = "FPS: "+(ticksum/timesum).toFixed(2);
		timesum=0;
		ticksum=0;
	}
	objLabel.innerText = "Selected object: "+objptr;
}


function transform(p) {
	var dist = G.GetDist(cam.x, cam.z, p.x, p.z);
	var angle = G.GetAngle(cam.x, cam.z, p.x, p.z);
	var np = G.PointAtAngle(cam.x, cam.z, angle+cam.rx, dist);
	var tp = {x:np.x, y:p.y, z:np.y};
	
	dist = G.GetDist(cam.y, cam.z, tp.y, tp.z);
	angle = G.GetAngle(cam.y, cam.z, tp.y, tp.z);
	np = G.PointAtAngle(cam.y, cam.z, angle-cam.ry, dist);
	tp.y = np.x;
	tp.z = np.y;
	
	if(tp.z<cam.z+mindist) return false;
	else return tp;
}

function screenX(x, z) {
	return Graphics.canvasMidX()+(x-cam.x)/(z-cam.z)*Math.min(Graphics.canvasMidX(), Graphics.canvasMidY());
}
function screenY(y, z) {
	return Graphics.canvasMidY()-(y-cam.y)/(z-cam.z)*Math.min(Graphics.canvasMidX(), Graphics.canvasMidY());
}

function screenN(n, z) {
	return n/(z-cam.z)*Math.min(Graphics.canvasMidX(), Graphics.canvasMidY());
}

function screen(p) {
	var np = transform(p);
	if(np===false) return false;
	else return {x:np.x, y:np.y, z:np.z, sx:screenX(np.x, np.z), sy:screenY(np.y, np.z)};
}



function Render() {
	Graphics.Draw({type:"rect", fromX:0, fromY:0, toX:Graphics.canvasWidth, toY:Graphics.canvasHeight, color:"rgb(200,240,255)"});
	if(options.faces || options.lines || options.points) {
		for(var ob=0; ob<objects.length; ob++) {
			var scrobj = [];
			//preprocess verticies
			for(var i=0; i<objects[ob].points.length; i++) {
				scrobj.push(screen(objects[ob].points[i]))
			}
			//draw polygons
			if(options.faces) {
				Graphics.ctx.setTransform(1, 0, 0, 1, 0, 0);
				Graphics.ctx.fillStyle = "rgba(0,0,0,0.5)";
				for(var i=0; i<objects[ob].faces.length; i++) {
					var face = objects[ob].faces[i];
					
					Graphics.ctx.beginPath();
					
					var p;
					var skip = false;
					for(var j = 0; j<face.length; j++) {
						p = scrobj[objects[ob].faces[i][j]]
						if(p===false) {
							skip = true;
							break;
						}
						else {
							if(j===0) Graphics.ctx.moveTo(p.sx, p.sy);
							else Graphics.ctx.lineTo(p.sx, p.sy);
						}
					}
					if(skip) continue;
					Graphics.ctx.closePath();
					Graphics.ctx.fill();
					
					//Graphics.Draw({type:"polygon", points:p, color:"black"});
				}
			}
			//draw lines
			if(options.lines) {
				Graphics.ctx.setTransform(1,0,0,1,0,0);
				Graphics.ctx.fillStyle = "rgb(0,0,0)";
				Graphics.ctx.lineWidth = 1;
				var p1, p2;
				for(var i=0; i<objects[ob].lines.length; i++) {
					p1 = scrobj[objects[ob].lines[i].a];
					p2 = scrobj[objects[ob].lines[i].b];
					if(p1===false || p2===false) continue;
					
					Graphics.ctx.beginPath();
					Graphics.ctx.moveTo(p1.sx, p1.sy);
					Graphics.ctx.lineTo(p2.sx, p2.sy);
					Graphics.ctx.stroke();
					
					//Graphics.Draw({type:"line", x1:p1.sx, y1:p1.sy, x2:p2.sx, y2:p2.sy, width:1, color:"black"});
				}
			}
			//draw verticies
			if(options.points || options.ids || options.lgb) {
				var p, x, y;
				for(var i=0; i<objects[ob].points.length; i++) {
					p = scrobj[i]
					if(p===false) continue;
					
					x = p.sx;
					y = p.sy;
					
					
					//draw nodes
					if(options.lgb) {
						//stupid logicboard joke
						if(Math.random()<0.7) {
							Graphics.Draw({type:"rect", x:x, y:y, width:screenN(0.4, p.z), height:screenN(0.25, p.z), color:"rgb(200, 200, 200)", outlineWidth:screenN(0.02, p.z), outline:"black"});
							Graphics.Draw({type:"text", x:x, y:y, font:G.FontStyle(screenN(0.15, p.z)), text:Math.random()<0.5?"AND":"OR", color:"black"});
						}
						else {
							Graphics.Draw({type:"circle", x:x, y:y, r:screenN(0.15, p.z), color:"red", outlineWidth:screenN(0.02, p.z), outline:"black"});
							Graphics.Draw({type:"text", x:x, y:y, font:G.FontStyle(screenN(0.15, p.z)), text:"NOT", color:"black"});
						}
					}
					else {
						if(options.points) Graphics.Draw({type:"circle", x:x, y:y, r:screenN(0.05, p.z), color:"black"});
						if(options.ids) Graphics.Draw({type:"text", x:x, y:y, font:G.FontStyle(screenN(0.2, p.z)), text:i, color:"red"});
					}
				}
			}
		}
	}
	
	for(var i = 0; i<sprites.length; i++) {
		var sp = sprites[i];
		var p = screen(sp);
		if(p===false) continue;
		Graphics.Draw({type:"circle", x:p.sx, y:p.sy, r:screenN(sp.size, p.z), color:sp.color});
	}
}














//drag file over canvas
$("#canvas").on("dragover", function(e) {
	e.preventDefault();
});
$("#canvas").on("dragenter", function() {
	//show drag hint
});
$("#canvas").on("dragleave dragend", function(e) {
	e.stopPropagation();
	//hide drag hint
});
//Drag & Drop .obj file
$("#canvas").on("drop", function(e) {
	e.preventDefault();
	//hide drag hint
	var file=e.originalEvent.dataTransfer.files[0];
	var fName = file.name;
	if(fName.slice(-4)!==".obj") alert("Unsupported file type!");
	else if(file.size>5000000/*5MB*/) alert("The file is too big!");
	else {
		var r = new FileReader();
		r.onload = function(e) {
			var content = e.target.result;
			if(content=="" || content==null || content==false) alert("The file is empty!");
			else LoadObjModel(content, fName);
		};
		r.readAsText(file);
	}
});


function LoadObjModel(data, filename) {
	data = data.split("\n");
	var obj = {points:[], lines:[], faces:[]};
	for(var i=0; i<data.length; i++) {
		data[i] = data[i].trim().split(" ");
		if(data[i].length<4 || (data[i][0]!=="v" && data[i][0]!=="f")) {
			data.splice(i, 1);
			i--;
			continue;
		}
		for(var j=0; j<data[i].length; j++) {
			if(data[i][j]==="") {
				data[i].splice(j, 1);
				j--;
			}
		}
		if(data[i][0]==="v") obj.points.push({x:parseFloat(data[i][1]),y:parseFloat(data[i][2]),z:parseFloat(data[i][3])});
		else if(data[i][0]==="f") {
			obj.faces.push([]);
			var face = obj.faces[obj.faces.length-1]
			for(var j = 1; j<data[i].length; j++) {
				face.push(parseInt(data[i][j].split("/")[0])-1);
			}
			for(var j = 0; j<face.length; j++) {
				for(var k = j+1; k<face.length; k++) {
					obj.lines.push({a:face[j],b:face[k]});
				}
			}
		}
	}
	for(var i = 0; i<obj.lines.length; i++) {
		var line = obj.lines[i];
		for(var j = i+1;j<obj.lines.length; j++) {
			if((obj.lines[j].a===line.a && obj.lines[j].b===line.b) || (obj.lines[j].a===line.b && obj.lines[j].b===line.a)) {
				obj.lines.splice(j, 1);
				j--;
			}
		}
	}
	objects.push(obj);
	objptr = objects.length-1;
	console.log(filename + " successfully loaded. V:"+obj.points.length+", L:"+obj.lines.length+", F:"+obj.faces.length);
	
}







if(scene==="deer") {
	
	(function(){
		var script = document.createElement("script");
		script.src = root+"objects/deer.js";
		document.head.appendChild(script);
	})()
	
}

