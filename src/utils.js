var Utils = {};

//ADD NUMERICAL SORT FOR ARRAYS 
Array.prototype.NumSort = function() {
	return this.sort(function(a, b) {
		return a - b;
	});
};

//DELETE ELEMENT IN ARRAY
Array.prototype.delete = function(index, preserveIndicies) {
	if(preserveIndicies===true) delete this[index];
	else this.splice(index, 1);
	return this;
};

//POLYFILL IF BROWSER DOESN'T SUPPORT .includes FOR ARRAYS
if(!Array.prototype.includes) Array.prototype.includes = function(searchElement) {
	if(this == null) throw new TypeError("Array.prototype.includes called on null or undefined");
	var O = Object(this);
	var len = parseInt(O.length, 10) || 0;
	if(len===0) return false;
	var n = parseInt(arguments[1], 10) || 0;
	var k;
	if(n>=0) k = n;
	else {
		k = len + n;
		if(k<0) k = 0;
	}
	var currentElement;
	while(k < len) {
		currentElement = O[k];
		if(searchElement===currentElement || (searchElement !== searchElement && currentElement !== currentElement)) return true;
		k++;
	}
	return false;
}

//POLYFILL IF BROWSER DOESN'T SUPPORT .bind FOR FUNCTIONS
if(!Function.prototype.bind) {
	Function.prototype.bind = function() { 
		var fn = this,
		args = Array.prototype.slice.call(arguments),
		object = args.shift();
		return function() { 
			return fn.apply(object, args.concat(Array.prototype.slice.call(arguments))); 
		}; 
	};
}

//ROUND-OFF NUMBER TO GIVEN DECIMAL PLACES
Number.prototype.fixedTo = function(pos) {
	return parseFloat(this.valueOf().toFixed(pos));
};


//TIME EVENT CONSTRUCTOR (UNIX Timestamp - miliseconds)
function Timestamp(unixtime) {
	if(Utils.ValidNum(unixtime)) this.time = unixtime;
	else this.time = Date.now();
	
	//Get time passed (ms)
	this.since = function() {
		return Date.now()-this.time;
	};
}

//Format STRING - check if empty or spaces, convert number to string - returns given string, else returns empty string (by default)
Utils.FormatString = function(txt, def) {
	if(def==undefined) def="";
	if(typeof txt==="number") txt = txt.toString();
	if(typeof txt!=="string") return def;
	if(txt==="" || txt.split(" ").join("")==="") return def;
	for(var i=0; i<txt.length; i++) {
		if(txt[i]!==" ") {
			txt = txt.substr(i);
			break;
		}
	}
	for(var i=txt.length-1; i>=0; i--) {
		if(txt[i]!==" ") {
			txt = txt.substr(0, i+1);
			break;
		}
	}
	if(txt==="") return def;
	return txt;
};

//Format NUMBER (convert from string), invalid number returns false (by default)
Utils.FormatNum = function(num, def) {
	if(def==undefined) def=false;
	if(typeof num!=="number" && typeof num!=="string") return def;
	if(typeof num==="string" && (num==="" || num.split(" ").join("")==="")) return def;
	else if(typeof num==="string") {
		if(!isNaN(parseFloat(num))) num = parseFloat(num);
		else return def;
	}
	if(!isFinite(num) || isNaN(num)) return def;
	return num;
};

//Validate STRING
Utils.ValidString = function(str, arr) {
	for(var i=0; i<arr.length; i++) {
		if(str==arr[i]) return true;
	}
	return false;
};

//Validate NUMBERS
Utils.ValidNum = function() {
	for(var i=0; i<arguments.length; i++) {
		var n = arguments[i];
		if(typeof(n)!=="number" || !isFinite(n) || isNaN(n)) return false;
	}
	return true;
};

//Load external script
Utils.LoadScript = function(source, callback) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.onload = function() {
		callback(true);
	};
	script.onerror = script.onabort = function() {
		callback(false);
	};
	script.src = source;
	document.head.appendChild(script);
};

//DEEP COPY ARRAYS/OBJECTS
Utils.DeepCopy = function(item) {
	return JSON.parse(JSON.stringify(item));
};

//Convert Degrees to Radians
Math.toRad = function(deg) {
	return (deg%360)*(Math.PI/180);
};

//Convert Radians to Degrees
Math.toDeg = function(rad) {
	return (((rad*180)/Math.PI)%360).fixedTo(15);
};

//Square a number (power of 2)
Math.sqr = function(num) {
	return num*num;
};

//Clamp a number to a range
Math.Clamp = function(num, min, max) {
	if(min==undefined && max==undefined) {
		min = 0;
		max = 1;
	}
	else if(min==undefined) min = -Infinity;
	else if(max==undefined) max = Infinity;
	
	return Math.min(max, Math.max(min, num));
};

//RANDOM INTEGER Number - Range: (min <= x < max) ------ (0,2) returns 0 or 1
Math.RandomRange = function(min, max) {
	return Math.floor(Math.random()*(max-min)+min);
};

//RANDOM FLOAT Number - Range: (min <= x <= max) ------ (0,2) returns 0 to 2
Math.RandomRangeFloat = function(min, max) {
	return Math.random()*(max-min)+min;
};

//RANDOM BOOLEAN - True/False - OPTIONAL Probability
Math.Random = function(probability) {
	if(Utils.ValidNum(probability)) return Math.random()<Math.Clamp(chance, 0, 1);
	else return Math.random()>=0.5;
};

//RANDOM RANGE (with weighted probability)
Math.WeightedRandom = function(arg) {
	if(typeof(arg[1])!=="object") var arr = arguments;
	else var arr = arg;
	var ranges = [];
	var sum = 0;
	for(var i=0; i<arr.length; i++) {
		sum+=arr[i][1];
		ranges.push(sum);
	}
	var random = Math.RandomRangeFloat(0, sum);
	for(var i=0; i<arr.length; i++) {
		if(random<=ranges[i]) return arr[i][0];
	}
	return false;
};

//Calculate average number from any amount of numbers
Math.Average = function(arg) {
	if(typeof(arg)!=="object") var arr = arguments;
	else var arr = arg;
	var sum = 0;
	for(var i=0; i<arr.length; i++) {
		sum+=arr[i];
	}
	return sum/i;
};

//Calculate weighted average from any amount of numbers (use arrays in this format: [number1, weight1], [number2, weight2], ...)
Math.WeightedAverage = function(arg) {
	if(typeof(arg[0])!=="object") var arr = arguments;
	else var arr = arg;
	var weightSum = 0;
	var valueSum = 0;
	for(var i=0; i<arr.length; i++) {
		valueSum+=arr[i][0]*arr[i][1];
		weightSum+=arr[i][1];
	}
	return valueSum/weightSum;
};

//SAVE DATA To file (download file)
Utils.SaveToTextFile = function(filename, extension, data) {
	if(!window.navigator.msSaveBlob) {
		var a = document.createElement("a");
		a.setAttribute("href", "data:text/plain;charset=utf-8," + data);
		a.setAttribute("download", filename+"."+extension);
		a.style.display = "none";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
	else {
		var blobObject = new Blob([data]); 
		window.navigator.msSaveBlob(blobObject, filename+"."+extension);
	}
};

//OPEN FILE Dialogue (callback gets (file, fileName, fileSize))
Utils.OpenFileDialog = function(callback) {
	var dlg = document.createElement("input");
	dlg.type = "file";
	$dlg = $(dlg);
	$dlg.change(function() {
		var file = dlg.files[0];
		callback(file, file.name, file.size);
	});
	dlg.click();
};

//LOAD DATA from file
Utils.ReadTextFile = function(file, callback) {
	try {
		var reader = new FileReader();
		reader.onload = function(e) {
			var content = e.target.result;
			callback(content);
		};
		reader.readAsText(file);
	}
	catch(e) {
		callback(false, e);
	}
};