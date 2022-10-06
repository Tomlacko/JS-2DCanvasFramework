//---VECTOR CONSTRUCTOR---//
function Vector(a, b, c, d) {
	if(typeof a==="number" && !isNaN(a)) {
		if(b===undefined) {
			var angle = Math.toRad(a);
			this.x = Math.cos(angle).fixedTo(15);
			this.y = Math.sin(angle).fixedTo(15);
		}
		else if(c===undefined || d===undefined) {
			this.x = a;
			this.y = b;
		}
		else {
			this.x = c-a;
			this.y = d-b;
		}
	}
	else throw "Cannot create Vector - Invalid value!";
}

//Create a copy of vector
Vector.prototype.Copy = function() {
	return new Vector(this.x, this.y);
};

//Get vector length
Vector.prototype.Length = function() {
	return Math.sqrt(this.x*this.x + this.y*this.y);
};

//Normalize vector (set length -> 1) (if known, length can be provided as a parameter, so it doesn't have to be calculated again)
Vector.prototype.Normalize = function(length) {
	if(typeof length!=="number") length = this.Length();
	return new Vector(this.x/length, this.y/length);
};

//Get vector angle --OR-- get angle between two vectors
Vector.prototype.Angle = function(v) {
	if(typeof v==="object" && typeof v.x==="number" && typeof v.y==="number") {
		var a = Math.atan2(this.y, this.x);
		var b = Math.atan2(v.y, v.x);
		var angle = Math.toDeg(Math.abs(a-b)).fixedTo(15);
		if(angle>180) return 360-angle;
		else return angle;
	}
	else return Math.toDeg(Math.atan2(this.y, this.x)).fixedTo(15);
};

//Rotate vector (add angle to vector)
Vector.prototype.Rotate = function(a) {
	var r = this.Length();
	var angle = Math.acos(this.x/r) + Math.toRad(a);
	this.x = r*Math.cos(angle).fixedTo(15);
	this.y = r*Math.sin(angle).fixedTo(15);
	return this;
};

//Reverse vector (opposite direction)
Vector.prototype.Reverse = function() {
	return new Vector(-this.x, -this.y);
};

//Perpendicular vector (rotate 90 degrees) (dir = true/false - clockwise/anti-cw)
Vector.prototype.Perpendicular = function(dir) {
	if(dir===true) {
		var x = this.y;
		var y = -this.x;
	}
	else {
		var x = -this.y;
		var y = this.x;
	}
	return new Vector(x, y);
};

//Add any amount of vectors together
Vector.prototype.Add = function() {
	var x = this.x;
	var y = this.y;
	for(var i=0; i<arguments.length; i++) {
		var v = arguments[i];
		if(typeof v!=="object" || typeof v.x!=="number" || typeof v.y!=="number") throw "Invalid vector (parameter "+(i+1)+")";
		else {
			x+=v.x;
			y+=v.y;
		}
	}
	return new Vector(x, y);
};

//Subtract any amount of vectors
Vector.prototype.Subtract = function() {
	var x = this.x;
	var y = this.y;
	for(var i=0; i<arguments.length; i++) {
		var v = arguments[i];
		if(typeof v!=="object" || typeof v.x!=="number" || typeof v.y!=="number") throw "Invalid vector (parameter "+(i+1)+")";
		else {
			x-=v.x;
			y-=v.y;
		}
	}
	return new Vector(x, y);
};

//Multiply vector by value(s) or by another vector
Vector.prototype.Multiply = function(a, b) {
	if(typeof a==="number") {
		if(typeof b==="number") return new Vector(this.x*a, this.y*b);
		else return new Vector(this.x*a, this.y*a);
	}
	else if(typeof a==="object") return new Vector(this.x*a.x, this.y*a.y);
	else throw "Invalid multiplication parameters!";
};

//Get average vector from any amount of vectors
Vector.prototype.Average = function() {
	var x = this.x;
	var y = this.y;
	var n = 1;
	for(var i=0; i<arguments.length; i++) {
		var v = arguments[i];
		if(typeof v!=="object" || typeof v.x!=="number" || typeof v.y!=="number") throw "Invalid vector (parameter "+(i+1)+")";
		else {
			x+=v.x;
			y+=v.y;
			n++;
		}
	}
	return new Vector(x/n, y/n);
};

//Multiply two vectors - DOT Product (returns scalar not a vector)
Vector.prototype.Dot = function(v) {
	if(typeof v!=="object" || typeof v.x!=="number" || typeof v.y!=="number") throw "Invalid vector";
	else return this.x*v.x+this.y*v.y;
};

//Get scalar projection of vector onto a given vector
Vector.prototype.ScalarProject = function(v) {
	if(typeof v!=="object" || (v.x===0 && v.y===0)) throw "Invalid vector";
	return this.Dot(v)/v.Length();
};

//Get vector projection of one vector onto a given vector
Vector.prototype.VectorProject = function(v) {
	if(typeof v!=="object" || (v.x===0 && v.y===0)) throw "Invalid vector";
	var n = this.Dot(v)/(v.x*v.x+v.y*v.y);
	return new Vector(v.x*n, v.y*n);
};

//Get vector rejection from projection of one vector onto a given vector
Vector.prototype.VectorReject = function(v) {
	if(typeof v!=="object" || (v.x===0 && v.y===0)) throw "Invalid vector";
	var n = this.VectorProject(v);
	return new Vector(n.x, n.y, this.x, this.y);
};