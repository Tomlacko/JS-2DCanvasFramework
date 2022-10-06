var Graphics = {
	canvas:null,
	ctx:null,
	setWidth:false,
	setHeight:false,
	canvasX:0,
	canvasY:0,
	canvasWidth:0,
	canvasHeight:0,
	canvasMidX:function(){return Graphics.canvasX+Graphics.canvasWidth/2/Graphics.canvasZoom;},
	canvasMidY:function(){return Graphics.canvasY+Graphics.canvasHeight/2/Graphics.canvasZoom;},
	canvasZoom:1,
	canvasMaxZoom:Infinity,
	canvasMinZoom:0,
	canvasAngle:0,
	Textures:{
		MissingTexture:{loaded:false}
	},
	RenderFunc:function(){}
};

//TEXTURE CONSTRUCTOR
Graphics.Texture = function(name, source, callback) {
	//prepare image
	var img = new Image();
	img.backRef = this;
	img.onload = function() {
		var This = this.backRef;
		This.loaded = true;
		This.img = this;
		This.width = this.width;
		This.height = this.height;
		try {
			This.pattern.repeat = Graphics.ctx.createPattern(this, "repeat");
			This.pattern.norepeat = Graphics.ctx.createPattern(this, "no-repeat");
		}
		catch(e) {
			console.warn("!!! INVALID TEXTURE !!! - " + This.name + " - " + This.src);
		}
		if(typeof(callback)==="function") setTimeout(function() {callback(This, true);}, 0);
	};
	img.onerror = img.onabort = function() {
		var This = this.backRef;
		console.warn("!!! IMAGE NOT FOUND !!! - " + This.name + " - " + This.src);
		if(typeof(callback)==="function") setTimeout(function() {callback(This, true);}, 0);
	};
	img.src = source;
	
	//create texture object
	this.name = name;
	this.type = "image";
	this.src = source;
	this.loaded = false;
	this.width = 1;
	this.height = 1;
	this.img = "rgba(255,0,220,1)";
	this.pattern = {
		repeat:Graphics.Textures.MissingTexture.pattern.repeat,
		norepeat:Graphics.Textures.MissingTexture.pattern.norepeat
	};
	this.Get = function(repeat) {
		if(repeat===false) return this.pattern.norepeat;
		else return this.pattern.repeat;
	};
};

//BITMAP TEXTURE CONSTRUCTOR
Graphics.BitmapTexture = function(name, bitmap) {
	if(bitmap instanceof ImageData) var imgData = bitmap;
	else var imgData = Graphics.BitmapToImageData(bitmap);
	
	this.name = name;
	this.type = "bitmap";
	this.loaded = true;
	this.width = imgData.width;
	this.height = imgData.height;
	this.img = imgData;
	
	var tempCanvas = document.createElement("canvas");
	var tempCtx = tempCanvas.getContext("2d");
	tempCanvas.width = this.width;
	tempCanvas.height = this.height;
	tempCtx.putImageData(imgData, 0, 0);
	
	this.pattern = {
		repeat:Graphics.ctx.createPattern(tempCanvas, "repeat"),
		norepeat:Graphics.ctx.createPattern(tempCanvas, "no-repeat")
	};
	this.Get = function(repeat) {
		if(repeat===false) return this.pattern.norepeat;
		else return this.pattern.repeat;
	};
};

//Preload images
Graphics.PreloadTextures = function(callback, images) {
	var loadedImages = 0;
	var numImages = 0;
	for(var name in images) numImages++;
	if(numImages===0) {
		setTimeout(callback, 0);
		return;
	}
	for(var name in images) {
		Graphics.Textures[name] = new Graphics.Texture(name, images[name], function() {
			if(++loadedImages>=numImages) setTimeout(callback, 0);
		});
	}
};

//Resize canvas
Graphics.ResizeCanvas = function() {
	if(this.setWidth===false) this.canvas.width = $(window).width();
	else if(this.canvas.width!==this.setWidth) this.canvas.width = this.setWidth;
	if(this.setHeight===false) this.canvas.height = $(window).height();
	else if(this.canvas.height!==this.setHeight) this.canvas.width = this.setHeight;
	this.canvasWidth = this.canvas.width;
	this.canvasHeight = this.canvas.height;
};

Graphics.SetCanvasSize = function(w, h) {
	if(Utils.ValidNum(w)) Graphics.setWidth = w;
	else Graphics.setWidth = false;
	if(Utils.ValidNum(h)) Graphics.setHeight = h;
	else Graphics.setHeight = false;
	Graphics.ResizeCanvas();
};

//INITIALIZE CANVAS
Graphics.InitCanvas = function(id) {
	this.canvas = document.getElementById(id);
	this.ctx = this.canvas.getContext("2d");
	this.ResizeCanvas();
	$(window).on("resize", function() {
		Graphics.ResizeCanvas();
		Graphics.Render();
	});
	
	//CREATE MISSING TEXTURE
	var mtx = Graphics.Textures.MissingTexture = new Graphics.BitmapTexture("MissingTexture", Graphics.GenerateBitmap(128, 128, function(x, y, width, height) {
		if((x<64 && y<64) || (x>=64 && y>=64)) return {r:255, g:0, b:222, a:255};
		else return {r:0, g:0, b:0, a:255};
	}));
	mtx.color = RGBA(255, 0, 220, 1);
	mtx.loaded = false;
	mtx.image = document.createElement("img");
	mtx.image.backRef = mtx;
	mtx.image.onload = function() {
		this.backRef.loaded = true;
	};
	mtx.src = Graphics.Textures.MissingTexture.image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAAmElEQVRIS7XNoRHAMADDwOw/Y3dpiZCIHFCf6J/Pe56rzu3kM9g++Qy2Tz6D7ZPPYPvkM9g++Qy2Tz6D7ZPPYPvkM9g++Qy2Tz6D7ZPPYPvkM9g++Qy2Tz6D/Tf9ZbB98hlsn3wG2yefwfbJZ7B98hlsn3wG2yefwfbJZ7B98hlsn3wG2yefwfbJZ7B98hlsn3wG2ycfnecDA6+2Ll+pG1sAAAAASUVORK5CYII=";
};

//MEASURE TEXT (before drawing on canvas)
Graphics.GetTextWidth = function(text, fontStyle) {
	Graphics.ctx.font = fontStyle;
	return Graphics.ctx.measureText(text).width;
};

//Calculate distance effect
Graphics.ApplyDistanceX = function(x, distance) {
	if(distance==0) return x;
	var mx = this.canvasMidX();
	return mx + ((x-mx)/distance);
};
Graphics.ApplyDistanceY = function(y, distance) {
	if(distance==0) return y;
	var my = this.canvasMidY();
	return my + ((y-my)/distance);
};

//Placeholder render function
Graphics.Render = function() {
	Graphics.ClearCanvas();
};

//CLEAR CANVAS
Graphics.ClearCanvas = function() {
	this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
};

//DRAW ANY OBJECT
Graphics.Draw = function(obj) {
	//type
	var type = obj.type;
	if(typeof(type)!=="string") throw "!!! Undefined object shape !!!";
	
	if(obj.display===false || obj.display==="false") return false;
	
	//texture
	var fillType = "repeat";
	var textureType = "color";
	var texture = obj.texture || obj.fill || obj.color;
	if(type==="image") {
		textureType = "image";
		fillType = "norepeat";
		if(!(texture instanceof HTMLImageElement)) {
			console.warn("Invalid texture type! (Image expected)");
			texture = Graphics.Textures.MissingTexture.image;
			var imgWidth = Graphics.Textures.MissingTexture.width;
			var imgHeight = Graphics.Textures.MissingTexture.height;
		}
		else {
			var imgWidth = texture.width;
			var imgHeight = texture.height;
		}
	}
	else if(type==="bitmap" || type==="imagedata") {
		textureType = "imagedata";
		fillType = "norepeat";
		if(texture instanceof Array) texture = Graphics.BitmapToImageData(texture);
		else if(!(texture instanceof ImageData)) {
			console.warn("Invalid texture type! (ImageData or Bitmap expected)");
			texture = Graphics.Textures.MissingTexture.img;
		}
		var imgWidth = texture.width;
		var imgHeight = texture.height;
	}
	else {
		if((texture instanceof Graphics.Texture) || (texture instanceof Graphics.BitmapTexture)) {
			textureType = "texture";
			var imgWidth = texture.width;
			var imgHeight = texture.height;
			if(obj.fillType!=undefined) fillType = obj.fillType;
			texture = texture.Get(fillType!=="norepeat");
		}
		else if(typeof(texture)!=="string") throw "Undefined texture !!!";
	}
	
	
	//outlineTexture
	var outlineTexture = obj.outlineTexture || obj.stroke || obj.outlineColor || obj.outline;
	if(outlineTexture instanceof Graphics.Texture) outlineTexture = outlineTexture.Get();
	else if(typeof(outlineTexture)==="string") outlineTexture = obj.outlineTexture;
	else outlineTexture = false;
	
	//hollow
	if(obj.hollow===true) var hollow = true;
	else var hollow = false;
	
	if(hollow && outlineTexture===false) return true;
	
	//texture offset
	var textureOffsetX = Utils.ValidNum(obj.textureOffsetX)?obj.textureOffsetX:0;
	var textureOffsetY = Utils.ValidNum(obj.textureOffsetY)?obj.textureOffsetY:0;
	
	//texture scale (zoom)
	var textureScaleX = 1;
	var textureScaleY = 1;
	
	if(Utils.ValidNum(obj.textureZoom)) {
		textureScaleX = obj.textureZoom;
		textureScaleY = obj.textureZoom;
	}
	else if(Utils.ValidNum(obj.textureScale)) {
		textureScaleX = obj.textureScale;
		textureScaleY = obj.textureScale;
	}
	else {
		if(Utils.ValidNum(obj.textureScaleX)) textureScaleX = obj.textureScaleX;
		if(Utils.ValidNum(obj.textureScaleY)) textureScaleY = obj.textureScaleY;
	}
	
	//opacity
	if(Utils.ValidNum(obj.opacity)) {
		var textureOpacity = Math.Clamp(obj.opacity);
		var outlineOpacity = Math.Clamp(obj.opacity);
	}
	else {
		var textureOpacity = 1;
		var outlineOpacity = 1;
	}
	if(Utils.ValidNum(obj.textureOpacity)) var textureOpacity = Math.Clamp(obj.textureOpacity);
	if(Utils.ValidNum(obj.outlineOpacity)) var outlineOpacity = Math.Clamp(obj.outlineOpacity);
	
	
	//rotation
	var rotation = obj.angle || obj.rotation;
	rotation = (Utils.ValidNum(rotation)?rotation:0);
	var textureRotation = (Utils.ValidNum(obj.textureAngle)?obj.textureAngle:0);
	
	this.ctx.fillStyle = texture;
	if(type==="line") {
		if(Utils.ValidNum(obj.width)) this.ctx.lineWidth = obj.width;
		else if(Utils.ValidNum(obj.outlineWidth)) this.ctx.lineWidth = obj.outlineWidth;
		else this.ctx.lineWidth = 2;
	}
	else if(outlineTexture!==false) {
		this.ctx.strokeStyle = outlineTexture;
		if(Utils.ValidNum(obj.outlineWidth)) {
			this.ctx.lineWidth = obj.outlineWidth;
			if(!hollow) this.ctx.lineWidth*=2;
		}
		else this.ctx.lineWidth = 2;
	}
	
	//total size of drawn object
	var totalWidth = 0;
	var totalHeight = 0;
	
	if(type==="layer") {								//LAYER (BACKGROUND / FOREGROUND)
		var x = 0;
		var y = 0;
		var width = Graphics.canvasWidth;
		var height = Graphics.canvasHeight;
		
		var GUI = true;
		var distance = 0;
		if(Utils.ValidNum(obj.distance) && obj.distance!==0) {
			distance = obj.distance;
			GUI = false;
		}
		
		//calculate centering
		if(obj.centerX===false) var centerX = 0;
		else if(Utils.ValidNum(obj.centerX)) var centerX = obj.centerX-this.canvasX;
		else if(GUI) var centerX = width/2;
		else var centerX = 0;
		if(obj.centerY===false) var centerY = 0;
		else if(Utils.ValidNum(obj.centerY)) var centerY = obj.centerY-this.canvasY;
		else if(GUI) var centerY = height/2;
		else var centerY = 0;
		
		//create path
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.beginPath();
		this.ctx.rect(x, y, width, height);
		
		var textureOriginX = x;
		var textureOriginY = y;
		
		totalWidth = width;
		totalHeight = height;
		
		
		//set texture stretching ratio based on texture mapping type
		if(textureType!=="color" && fillType!=="repeat" && fillType!=="norepeat") {
			var ratioX = totalWidth/imgWidth;
			var ratioY = totalHeight/imgHeight;
			
			if(fillType==="max") ratioX = ratioY = Math.max(ratioX, ratioY);
			else if(fillType==="min") ratioX = ratioY = Math.min(ratioX, ratioY);
			else if(fillType==="horizontal") ratioY = ratioX;
			else if(fillType==="vertical") ratioX = ratioY;
			
			textureScaleX*=ratioX;
			textureScaleY*=ratioY;
		}
		
		if(!GUI) {
			textureScaleX*=this.canvasZoom;
			textureScaleY*=this.canvasZoom;
		}
		var textureX = -textureOffsetX*textureScaleX;
		var textureY = -textureOffsetY*textureScaleY;
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		
		//global canvas rotation
		if(!GUI) {
			if(this.canvasAngle%(2*Math.PI)!==0) {
				this.ctx.translate(this.canvasWidth/2/this.canvasZoom, this.canvasHeight/2/this.canvasZoom);
				this.ctx.rotate(this.canvasAngle);
				this.ctx.translate(-this.canvasWidth/2/this.canvasZoom, -this.canvasHeight/2/this.canvasZoom);
			}
		}
		
		if(!GUI) this.ctx.translate(-this.canvasX*this.canvasZoom, -this.canvasY*this.canvasZoom);
		this.ctx.translate(centerX, centerY);
		this.ctx.rotate(Math.toRad(rotation+textureRotation));
		this.ctx.translate(textureX-centerX, textureY-centerY);
		this.ctx.scale(this.canvasZoom, this.canvasZoom);
		this.ctx.globalAlpha = textureOpacity;
		this.ctx.fill();
		
		
		return true;
	}
	
	
	
	//distance effect enable
	var GUI = false;
	var distance = 1;
	if(Utils.ValidNum(obj.distance)) {
		distance = obj.distance;
		if(distance===0) GUI = true;
	}
	
	//global canvas rotation
	this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	if(!GUI) {
		if(this.canvasZoom!==1) this.ctx.scale(this.canvasZoom, this.canvasZoom);
		if(this.canvasAngle%(2*Math.PI)!==0) {
			this.ctx.translate(this.canvasWidth/2/this.canvasZoom, this.canvasHeight/2/this.canvasZoom);
			this.ctx.rotate(this.canvasAngle);
			this.ctx.translate(-this.canvasWidth/2/this.canvasZoom, -this.canvasHeight/2/this.canvasZoom);
		}
	}
	
	///////DRAW OBJECT////////
	
	switch(type) {
		case "line":								//LINE
			if(Utils.ValidNum(obj.fromX, obj.fromY, obj.toX, obj.toY)) {
				var x1 = obj.fromX;
				var y1 = obj.fromY;
				var x2 = obj.toX;
				var y2 = obj.toY;
			}
			else if(obj.x1, obj.y1, obj.x2, obj.y2) {
				var x1 = obj.x1;
				var y1 = obj.y1;
				var x2 = obj.x2;
				var y2 = obj.y2;
			}
			else throw "Invalid line position!";
			
			if(!GUI) {
				x1 = this.ApplyDistanceX(x1, distance);
				y1 = this.ApplyDistanceY(y1, distance);
				x2 = this.ApplyDistanceX(x2, distance);
				y2 = this.ApplyDistanceY(y2, distance);
				x1-=this.canvasX;
				y1-=this.canvasY;
				x2-=this.canvasX;
				y2-=this.canvasY;
			}
			
			this.ctx.strokeStyle = texture || outlineTexture;
			
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
			
			var textureOriginX = x1;
			var textureOriginY = y1;
			
			totalWidth = this.ctx.lineWidth;
			totalHeight = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
			
			
			
			break;
		case "rect":								//RECTANGLE
			//convert values to consistent form
			if(Utils.ValidNum(obj.fromX, obj.fromY, obj.toX, obj.toY)) {
				var x = obj.fromX;
				var y = obj.fromY;
				var width = obj.toX-x;
				var height = obj.toY-y;
			}
			else if(Utils.ValidNum(obj.x1, obj.y1, obj.x2, obj.y2)) {
				var x = obj.x1;
				var y = obj.y1;
				var width = obj.x2-x;
				var height = obj.y2-y;
			}
			else if(Utils.ValidNum(obj.x, obj.y, obj.width, obj.height)) {
				if(obj.alignX==="left") var x = obj.x;
				else if(obj.alignX==="right") var x = obj.x - obj.width;
				else var x = obj.x-obj.width/2;
				if(obj.alignY==="top") var y = obj.y;
				else if(obj.alignY==="bottom") var y = obj.y - obj.height;
				else var y = obj.y-obj.height/2;
				var width = obj.width;
				var height = obj.height;
			}
			else throw "Invalid rectangle position/size!";
			
			if(Utils.ValidNum(obj.r) && obj.r>0) var r = Math.min(obj.r, Math.min(width, height)/2);
			else var r = false;
			
			if(!GUI) {
				x = this.ApplyDistanceX(x, distance);
				y = this.ApplyDistanceY(y, distance);
			}
			
			//calculate centering
			if(obj.centerX===false) var centerX = x;
			else if(Utils.ValidNum(obj.centerX)) var centerX = obj.centerX;
			else var centerX = x+(width/2);
			if(obj.centerY===false) var centerY = y;
			else if(Utils.ValidNum(obj.centerY)) var centerY = obj.centerY;
			else var centerY = y+(height/2);
			
			if(!GUI) {
				centerX-=this.canvasX;
				centerY-=this.canvasY;
				x-=this.canvasX;
				y-=this.canvasY;
			}
			
			//adjust position to begin drawing
			this.ctx.translate(centerX, centerY);
			this.ctx.rotate(Math.toRad(rotation));
			
			//create path
			this.ctx.beginPath();
			var xx = x-centerX;
			var yy = y-centerY;
			if(r===false) this.ctx.rect(xx, yy, width, height);
			else {
				this.ctx.moveTo(xx+r, yy);
				this.ctx.lineTo(xx+width-r, yy);
				this.ctx.arc(xx+width-r, yy+r, r, 1.5*Math.PI, 0, false);
				this.ctx.lineTo(xx+width, yy+height-r);
				this.ctx.arc(xx+width-r, yy+height-r, r, 0, Math.PI/2, false);
				this.ctx.lineTo(xx+r, yy+height);
				this.ctx.arc(xx+r, yy+height-r, r, Math.PI/2, Math.PI, false);
				this.ctx.lineTo(xx, yy+r);
				this.ctx.arc(xx+r, yy+r, r, Math.PI, 1.5*Math.PI, false);
				this.ctx.closePath();
			}
			
			//draw outline
			if(outlineTexture!==false) {
				this.ctx.globalAlpha = outlineOpacity;
				this.ctx.stroke();
			}
			
			var textureOriginX = x;
			var textureOriginY = y;
			
			totalWidth = width;
			totalHeight = height;
			
			
			
			break;
		case "circle":									//CIRCLE
			if(Utils.ValidNum(obj.x, obj.y, obj.r)) {
				var x = obj.x;
				var y = obj.y;
				var r = obj.r;
			}
			else throw "Invalid circle position/radius!";
			
			if(!GUI) {
				x = this.ApplyDistanceX(x, distance);
				y = this.ApplyDistanceY(y, distance);
			}
			
			//centering
			if(Utils.ValidNum(obj.centerX)) var centerX = obj.centerX;
			else var centerX = x;
			if(Utils.ValidNum(obj.centerY)) var centerY = obj.centerY;
			else var centerY = y;
			
			if(!GUI) {
				centerX-=this.canvasX;
				centerY-=this.canvasY;
				x-=this.canvasX;
				y-=this.canvasY;
			}
			
			//adjust position to begin drawing
			this.ctx.translate(centerX, centerY);
			this.ctx.rotate(Math.toRad(rotation));
			
			//create path
			this.ctx.beginPath();
			this.ctx.arc(x-centerX, y-centerY, r, 0, 2*Math.PI, false);
			
			//draw outline
			if(outlineTexture!==false) {
				this.ctx.globalAlpha = outlineOpacity;
				this.ctx.stroke();
			}
			
			var textureOriginX = x-r;
			var textureOriginY = y-r;
			
			totalWidth = r*2;
			totalHeight = r*2;
			
			
			
			break;
		case "polygon":									//POLYGON
			if(obj.points.length<3) throw "Polygon needs at least 3 vertices!";
			if(Utils.ValidNum(obj.x, obj.y)) {
				var x = obj.x;
				var y = obj.y;
			}
			else {
				var x = 0;
				var y = 0;
			}
			
			if(!GUI) {
				x = this.ApplyDistanceX(x, distance);
				y = this.ApplyDistanceY(y, distance);
				x-=this.canvasX;
				y-=this.canvasY;
			}
			
			//calculate centering
			if(Utils.ValidNum(obj.centerX)) {
				var centerX = obj.centerX;
				if(!GUI) centerX-=this.canvasX;
			}
			else var centerX = x + function() {
				var sum = 0;
				for(var i=0; i<obj.points.length; i++) sum+=obj.points[i].x;
				return sum/obj.points.length;
			}();
			if(Utils.ValidNum(obj.centerY)) {
				var centerY = obj.centerY;
				if(!GUI) centerY-=this.canvasY;
			}
			else var centerY = y + function() {
				var sum = 0;
				for(var i=0; i<obj.points.length; i++) sum+=obj.points[i].y;
				return sum/obj.points.length;
			}();
			
			//calculate total offset
			var adjustX = x-centerX;
			var adjustY = y-centerY;
			
			//adjust position to begin drawing
			this.ctx.translate(centerX, centerY);
			this.ctx.rotate(Math.toRad(rotation));
			
			//create path
			this.ctx.beginPath();
			this.ctx.moveTo(obj.points[0].x+adjustX, obj.points[0].y+adjustY);
			for(var i=1; i<obj.points.length; i++) this.ctx.lineTo(obj.points[i].x+adjustX, obj.points[i].y+adjustY);
			this.ctx.closePath();
			
			//draw outline
			if(outlineTexture!==false) {
				this.ctx.globalAlpha = outlineOpacity;
				this.ctx.stroke();
			}
			
			var textureOriginX = x;
			var textureOriginY = y;
			
			var minX = obj.points[0].x;
			var maxX = obj.points[0].x;
			var minY = obj.points[0].y;
			var maxY = obj.points[0].y;
			for(var i=1; i<obj.points.length; i++) {
				minX = Math.min(minX, obj.points[i].x);
				minY = Math.min(minY, obj.points[i].y);
				maxX = Math.max(maxX, obj.points[i].x);
				maxY = Math.max(maxY, obj.points[i].y);
			}
			totalWidth = maxX-minX;
			totalHeight = maxY-minY;
			
			
			
			break;
		case "text":									//TEXT
			if(Utils.ValidNum(obj.x, obj.y)) {
				var x = obj.x;
				var y = obj.y;
			}
			else throw "Invalid text position!";
			
			if(!GUI) {
				x = this.ApplyDistanceX(x, distance);
				y = this.ApplyDistanceY(y, distance);
			}
			
			//font style
			if(typeof(obj.font)==="string") this.ctx.font = obj.font;
			else if(typeof(obj.fontStyle)==="string") this.ctx.font = obj.fontStyle;
			else this.ctx.font = "16px sans-serif";
			
			//text alignment
			if(obj.alignX==="left") this.ctx.textAlign = "left";
			else if(obj.alignX==="right") this.ctx.textAlign = "right";
			else this.ctx.textAlign = "center";
			
			if(obj.alignY==="top-most" || obj.alignY==="top2") this.ctx.textBaseline = "top";
			else if(obj.alignY==="top") this.ctx.textBaseline = "hanging";
			else if(obj.alignY==="bottom-most" || obj.alignY==="bottom2") this.ctx.textBaseline = "bottom";
			else if(obj.alignY==="bottom") this.ctx.textBaseline = "alphabetic";
			else this.ctx.textBaseline = "middle";
			
			//calculate centering
			if(Utils.ValidNum(obj.centerX)) var centerX = obj.centerX;
			else var centerX = x; 
			if(Utils.ValidNum(obj.centerY)) var centerY = obj.centerY;
			else var centerY = y;
			
			if(!GUI) {
				centerX-=this.canvasX;
				centerY-=this.canvasY;
				x-=this.canvasX;
				y-=this.canvasY;
			}
			
			
			//adjust position to begin drawing
			this.ctx.translate(centerX, centerY);
			this.ctx.rotate(Math.toRad(rotation));
			
			//get text value
			var txt = Utils.FormatString(obj.text, "");
			
			//draw
			this.ctx.beginPath();
			if(outlineTexture!==false) {
				this.ctx.globalAlpha = outlineOpacity;
				this.ctx.strokeText(txt, x-centerX, y-centerY);
			}
			if(!hollow) {
				this.ctx.globalAlpha = textureOpacity;
				this.ctx.fillText(txt, x-centerX, y-centerY);
			}
			
			return true;
			
			
			
			break;
		case "bitmap": case "imagedata": case "image":		//BITMAP / IMAGE DATA / IMAGE			
			//convert values to consistent form
			var width = texture.width;
			var height = texture.height;
			
			if(Utils.ValidNum(obj.x, obj.y)) {
				if(obj.alignX==="left") var x = obj.x;
				else if(obj.alignX==="right") var x = obj.x - width;
				else var x = obj.x-width/2;
				if(obj.alignY==="top") var y = obj.y;
				else if(obj.alignY==="bottom") var y = obj.y - height;
				else var y = obj.y-height/2;
			}
			else throw "Invalid "+type+" position!";
			
			if(!GUI) {
				x = this.ApplyDistanceX(x, distance);
				y = this.ApplyDistanceY(y, distance);
			}
			
			//calculate centering
			if(obj.centerX===false) var centerX = x;
			else if(Utils.ValidNum(obj.centerX)) var centerX = obj.centerX;
			else var centerX = x+(width/2);
			if(obj.centerY===false) var centerY = y;
			else if(Utils.ValidNum(obj.centerY)) var centerY = obj.centerY;
			else var centerY = y+(height/2);
			
			if(!GUI) {
				centerX-=this.canvasX;
				centerY-=this.canvasY;
				x-=this.canvasX;
				y-=this.canvasY;
			}
			
			this.ctx.globalAlpha = textureOpacity;
			
			if(textureType==="image") {
				this.ctx.translate(centerX, centerY);
				this.ctx.rotate(Math.toRad(rotation));
				this.ctx.drawImage(texture, x-centerX, y-centerY);
			}
			else {
				//draw directly if no zoom
				if(this.canvasZoom===1 && rotation===0) {
					this.ctx.beginPath();
					this.ctx.putImageData(texture, x, y);
				}
				else {
					var tempCanvas = document.createElement("canvas");
					tempCanvas.width = width;
					tempCanvas.height = height;
					tempCtx = tempCanvas.getContext("2d");
					tempCtx.putImageData(texture, 0, 0);
					
					this.ctx.translate(centerX, centerY);
					this.ctx.rotate(Math.toRad(rotation));
					this.ctx.drawImage(tempCanvas, x-centerX, y-centerY);
				}
			}
			
			return true;
			
			
			
			break;
		default:
			throw "!!! Unknown shape !!!";
	}
	
	if(hollow) return;
	
	
	
	//set texture stretching ratio based on texture mapping type
	if(textureType!=="color" && fillType!=="repeat" && fillType!=="norepeat") {
		var ratioX = totalWidth/imgWidth;
		var ratioY = totalHeight/imgHeight;
		
		if(fillType==="max") ratioX = ratioY = Math.max(ratioX, ratioY);
		else if(fillType==="min") ratioX = ratioY = Math.min(ratioX, ratioY);
		else if(fillType==="horizontal") ratioY = ratioX;
		else if(fillType==="vertical") ratioX = ratioY;
		
		textureScaleX*=ratioX;
		textureScaleY*=ratioY;
	}
	
	//change transform to map texture
	var textureX = textureOriginX - textureOffsetX*textureScaleX;
	var textureY = textureOriginY - textureOffsetY*textureScaleY;
	this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	
	if(!GUI) {
		if(this.canvasZoom!==1) this.ctx.scale(this.canvasZoom, this.canvasZoom);
		if(this.canvasAngle%(2*Math.PI)!==0) {
			this.ctx.translate(this.canvasWidth/2/this.canvasZoom, this.canvasHeight/2/this.canvasZoom);
			this.ctx.rotate(this.canvasAngle);
			this.ctx.translate(-this.canvasWidth/2/this.canvasZoom, -this.canvasHeight/2/this.canvasZoom);
		}
	}
	
	//draw texture (fill object)
	if(type==="line") {
		this.ctx.translate(textureX, textureY);
		var r = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
		var rot = Math.acos((x2-x1)/r)-Math.PI/2;
		this.ctx.rotate(rot);
		this.ctx.translate(-this.ctx.lineWidth/2, 0);
	}
	else {
		this.ctx.translate(centerX, centerY);
		this.ctx.rotate(Math.toRad(rotation+textureRotation));
		this.ctx.translate(textureX-centerX, textureY-centerY);
	}
	this.ctx.scale(textureScaleX, textureScaleY);
	this.ctx.globalAlpha = textureOpacity;
	if(type==="line") this.ctx.stroke();
	else this.ctx.fill();
	
	return true;
};

//Set canvas zoom level
Graphics.SetCanvasZoom = function(newZoom) {
	if(Utils.ValidNum(newZoom) && newZoom<=Graphics.canvasMaxZoom && newZoom>=Graphics.canvasMinZoom) Graphics.canvasZoom = newZoom;
};

//Zoom canvas on certain point
Graphics.ZoomCanvasTo = function(x, y, newZoom) {
	if(newZoom<=Graphics.canvasMaxZoom && newZoom>=Graphics.canvasMinZoom) {
		Graphics.canvasX = x-((x-Graphics.canvasX)*Graphics.canvasZoom)/newZoom;
		Graphics.canvasY = y-((y-Graphics.canvasY)*Graphics.canvasZoom)/newZoom;
		Graphics.canvasZoom = newZoom;
	}
};

//Set canvas zoom level
Graphics.RotateCanvas = function(rotation) {
	if(Utils.ValidNum(rotation)) Graphics.canvasAngle = Math.toRad(rotation);
};

//Move center of canvas to pos
Graphics.CenterCanvasTo = function(x, y) {
	Graphics.canvasX = (x-Graphics.canvasWidth/2/Graphics.canvasZoom).fixedTo(15);
	Graphics.canvasY = (y-Graphics.canvasHeight/2/Graphics.canvasZoom).fixedTo(15);
};

//Move canvas origin to pos
Graphics.MoveCanvasTo = function(x, y) {
	Graphics.canvasX = x;
	Graphics.canvasY = y;
};

//Move canvas by amount
Graphics.MoveCanvasBy = function(x, y, relativeSpeed) {
	if(relativeSpeed===false) {
		Graphics.canvasX += x;
		Graphics.canvasY += y;
	}
	else {
		Graphics.canvasX += x/Graphics.canvasZoom;
		Graphics.canvasY += y/Graphics.canvasZoom;
	}
};

//return specific pixel from canvas
Graphics.GetCanvasPixel = function(x, y) {
	try {
		var imgData = Graphics.ctx.getImageData(x, y, 1, 1);
		var pixel = {};
		pixel.r = imgData.data[0];
		pixel.g = imgData.data[1];
		pixel.b = imgData.data[2];
		pixel.a = imgData.data[3];
	}
	catch(e) {
		var pixel = false;
		console.warn("!!! Cannot extract pixel - canvas is tainted by cross-origin images.");
	}
	return pixel;
};

//return x*y pixel area from canvas as array of pixels
Graphics.GetCanvasPixelArea = function(fromX, fromY, toX, toY) {
	try {
		var imgData = Graphics.ctx.getImageData(fromX, fromY, toX-fromX, toY-fromY);
		var bitmap = [];
		for(var x=0; x<imgData.width; x++) {
			bitmap.push([]);
			for(var y=0; y<imgData.height; y++) {
				bitmap[x].push({r:0, g:0, b:0, a:255});
			}
		}
		for(var i=0; i<imgData.data.length/4; i+=4) {
			var x = i%imgData.width;
			var y = Math.floor(i/imgData.height);
			bitmap[x][y].r = imgData.data[i*4];
			bitmap[x][y].g = imgData.data[i*4+1];
			bitmap[x][y].b = imgData.data[i*4+2];
			bitmap[x][y].a = imgData.data[i*4+3];
		}
	}
	catch(e) {
		var bitmap = false;
		console.warn("!!! Cannot extract bitmap data - canvas is tainted by cross-origin images.");
	}
	return bitmap;
};

//create pixel area that can be put on canvas
Graphics.GenerateBitmap = function(width, height, func) {
	var bitmap = [];
	for(var x = 0; x<width; x++) {
		bitmap.push([]);
		for(var y = 0; y<height; y++) {
			var pixel = func(x, y, width, height);
			if(typeof(pixel)!=="object") throw "Invalid pixel data returned!";
			if(pixel.a==undefined) pixel.a = 255;
			bitmap[x].push(pixel);
		}
	}
	return bitmap;
};

//save created bitmap to textures, to be used as other textures
Graphics.AddBitmapAsTexture = function(name, bitmap) {
	var texture = Graphics.Textures[name] = new Graphics.BitmapTexture(name, bitmap);
	return texture;
};

//convert bitmap array to canvas imagedata
Graphics.BitmapToImageData = function(bitmap) {
	var width = bitmap.length;
	var height = bitmap[0].length;
	
	var imgData = new Uint8ClampedArray(width*height*4);
	for(var i=0; i<width*height; i++) {
		var x = i%width;
		var y = Math.floor(i/height);
		
		var pixel = bitmap[x][y];
		
		imgData[i*4] = pixel.r;
		imgData[i*4+1] = pixel.g;
		imgData[i*4+2] = pixel.b;
		imgData[i*4+3] = pixel.a;
	}
	var newImgData = Graphics.ctx.createImageData(width, height);
	newImgData.data.set(imgData);
	return newImgData;
};

//convert canvas imagedata to bitmap array
Graphics.ImageDataToBitmap = function(imgData) {
	var bitmap = [];
	for(var x=0; x<imgData.width; x++) {
		bitmap.push([]);
		for(var y=0; y<imgData.height; y++) {
			bitmap[x].push({r:0, g:0, b:0, a:255});
		}
	}
	for(var i=0; i<imgData.data.length/4; i+=4) {
		var x = i%imgData.width;
		var y = Math.floor(i/imgData.height);
		bitmap[x][y].r = imgData.data[i*4];
		bitmap[x][y].g = imgData.data[i*4+1];
		bitmap[x][y].b = imgData.data[i*4+2];
		bitmap[x][y].a = imgData.data[i*4+3];
	}
	return bitmap;
};