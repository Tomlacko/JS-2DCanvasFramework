var Input = {
	Event:{},//for constructors
	mouseX:0,
	mouseY:0,
	events:{//active events
		mouseclick:[],
		mousemove:[],
		mousescroll:[],
		keypress:[]
	}
};

//check touch display capability
Input.isTouch = (function() {
	try {
		document.createEvent("TouchEvent");
		return true;
	}
	catch(e) {
		return false;
	}
}());

//mouse states
Input.mouseStates = {
	left:false,
	right:false,
	middle:false
};

//key names with IDs (http://keycode.info/)
Input.keyNames = {backspace:8, "back space":8, tab:9, enter:13, shift:16, ctrl:17, alt:18, pause:19, "break":19, "pause break":19, pausebreak:19, caps:20, capslock:20, "caps lock":20, esc:27, "escape":27, space:32, spacebar:32, "space bar":32, pageup:33, "page up":33, pagedown:34, "page down":34, end:35, home:36, left:37, up:38, right:39, down:40, insert:45, del:46, "delete":46, zero:48, "0":48, "é":48, one:49, "1":49, two:50, "2":50, "ě":50, three:51, "3":51, "š":51, four:52, "4":52, "č":52, five:53, "5":53, "ř":53, six:54, "6":54, "ž":54, seven:55, "7":55, "ý":55, eight:56, "8":56, "á":56, nine:57, "9":57, "í":57, a:65, b:66, c:67, d:68, e:69, f:70, g:71, h:72, i:73, j:74, k:75, l:76, m:77, n:78, o:79, p:80, q:81, r:82, s:83, t:84, u:85, v:86, w:87, x:88, y:89, z:90, windows:91, "windows key":91, "left windows":91, "windows left":91, "right windows":92, "windows right":92, "select":93, menu:93, context:93, "context menu":93, num0:96, "num 0":96, num1:97, "num 1":97, num2:98, "num 2":98, num3:99, "num 3":99, num4:100, "num 4":100, num5:101, "num 5":101, num6:102, "num 6":102, num7:103, "num 7":103, num8:104, "num 8":104, num9:105, "num 9":105, "num multiply":106, nummultiply:106, nummul:106, "num mul":106, "num*":106, star:106, "*":106, numplus:107, "num plus":107, "num+":107, "num minus":109, numminus:109, "num subtract":109, "num-":109, "num del":110, "num delete":110, numdel:110, "num decimal":110, "num.":110, "num period":110, "num divide":111, "num/":111, numdiv:111, "num div":111, f1:112, f2:113, f3:114, f4:115, f5:116, f6:117, f7:118, f8:119, f9:120, f10:121, f11:122, f12:123, num:144, numlock:144, "num lock":144, "scroll":145, scrolllock:145, "scroll lock":145, semicolon:186, "semi-colon":186, equal:187, equals:187, "equal sign":187, comma:188, dash:189, dot:190, period:190, "ˇ":191, "´":191, "forward slash":191, slash:191, grave:192, "grave accent":192, "ú":219, "bracket left":219, "left bracket":219, "open bracket":219, backslash:220, "back slash":220, "backwards slash":220, "bracket right":221, "right bracket":221, "close bracket":221, quote:222, "single quote":222};

//key states
Input.keyStates = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

//Key name to ID
Input.KeyID = function(keyName) {
	var id = Input.keyNames[keyName.toLowerCase()];
	if(id!=undefined) return id;
	else throw "Invalid Key Name! ("+keyName+")";
};

//get current key state
Input.KeyDown = function(keyName) {
	return Input.keyStates[Input.KeyID(keyName)];
};

//get mouse state
Input.MouseDown = function(button) {
	var name = button;
	if(typeof(button)==="number") {
		if(button===1) name="left";
		else if(button===2) name="middle";
		else if(button===3) name="right";
		else throw "Invalid Mouse Button! ("+button+")";
	}
	var result = Input.mouseStates[name.toLowerCase()];
	if(result==undefined) throw "Invalid Mouse Button! ("+button+")";
	else return result;
};


//MOUSECLICK EVENT CONSTRUCTOR
Input.Event.MouseClick = function(event, callback, onstopCallback) {
	var self = this;
	this.button = event.button;
	if(event.state==="up") this.state = "up";
	else this.state = "down";
	this.active = false;
	if(event.autoDestroy===true) this.autoDestroy = true;
	else this.autoDestroy = false;
	if(event.preventDefault===false) this.preventDefault = false;
	else this.preventDefault = true;
	if(event.disabled===true) this.disabled = true;
	else this.disabled = false;
	this.Enable = function() {
		self.disabled = false;
	};
	this.Disable = function() {
		if(self.repeat) {
			clearTimeout(self.repeatTimeout);
			self.repeatCount = 0;
		}
		self.disabled = true;
		self.active = false;
	};
	if(typeof(callback)==="function") this.Callback = callback;
	else this.Callback = function() {};
	if(typeof(onstopCallback)==="function") this.OnStop = onstopCallback;
	else this.OnStop = function() {};
	if(Utils.ValidNum(event.repeat) && event.repeat>=0) {
		this.repeatDelay = event.repeat;
		this.repeat = true;
		this.repeatCount = 0;
		this.repeatTimeout = null;
	}
	else this.repeat = false;
	this.activeButton = false;
	this.Trigger = function(button, e) {
		if(self.disabled || !self.active) return;
		if(self.repeat) {
			self.activeButton = button
			self.repeatCount++;
			self.repeatTimeout = setTimeout(function() {self.Trigger(self.activeButton)}, self.repeatDelay);
		}
		self.Callback(button, e);
	};
	this.Destroy = function() {
		self.active = false;
		self.Disable();
		Input.events.mouseclick.delete(self.id, true);
	};
	this.Start = function(button, e) {
		if(self.disabled) return;
		self.active = true;
		self.Trigger(button, e);
	};
	this.Stop = function(button, e) {
		self.active = false;
		if(self.autoDestroy) self.Destroy();
		else {
			if(self.repeat) {
				clearTimeout(self.repeatTimeout);
				self.repeatCount = 0;
			}
			self.OnStop(button, e);
		}
	};
	this.id = Input.events.mouseclick.push(this)-1;
};

//MOUSEMOVE EVENT CONSTRUCTOR
Input.Event.MouseMove = function(event, callback) {
	var self = this;
	if(event.autoDestroy===true) this.autoDestroy = true;
	else this.autoDestroy = false;
	if(event.preventDefault===false) this.preventDefault = false;
	else this.preventDefault = true;
	if(event.disabled===true) this.disabled = true;
	else this.disabled = false;
	this.Enable = function() {
		self.disabled = false;
	};
	this.Disable = function() {
		self.disabled = true;
		self.active = false;
	};
	if(typeof(callback)==="function") this.Callback = callback;
	else this.Callback = function() {};
	this.Trigger = function(x, y, e) {
		if(self.disabled) return;
		self.Callback(x, y, e);
	};
	this.Destroy = function() {
		self.active = false;
		self.Disable();
		Input.events.mousemove.delete(self.id, true);
	};
	this.id = Input.events.mousemove.push(this)-1;
};

//MOUSEMOVE EVENT CONSTRUCTOR
Input.Event.MouseScroll = function(event, callback) {
	var self = this;
	if(event.autoDestroy===true) this.autoDestroy = true;
	else this.autoDestroy = false;
	if(event.preventDefault===false) this.preventDefault = false;
	else this.preventDefault = true;
	if(event.direction==="up") this.direction = "up";
	else if(event.direction==="down") this.direction = "down";
	else this.direction = "both";
	if(event.disabled===true) this.disabled = true;
	else this.disabled = false;
	this.Enable = function() {
		self.disabled = false;
	};
	this.Disable = function() {
		self.disabled = true;
		self.active = false;
	};
	if(typeof(callback)==="function") this.Callback = callback;
	else this.Callback = function() {};
	this.Trigger = function(dir, e) {
		if(self.disabled) return;
		self.Callback(dir, e);
	};
	this.Destroy = function() {
		self.active = false;
		self.Disable();
		Input.events.mousemove.delete(self.id, true);
	};
	this.id = Input.events.mousescroll.push(this)-1;
};

//KEYPRESS EVENT CONSTRUCTOR
Input.Event.KeyPress = function(event, callback, onstopCallback) {
	var self = this;
	this.button = event.button;
	if(event.state==="up") this.state = "up";
	else this.state = "down";
	this.active = false;
	if(event.autoDestroy===true) this.autoDestroy = true;
	else this.autoDestroy = false;
	if(event.preventDefault===false) this.preventDefault = false;
	else this.preventDefault = true;
	if(event.disabled===true) this.disabled = true;
	else this.disabled = false;
	this.Enable = function() {
		self.disabled = false;
	};
	this.Disable = function() {
		if(self.repeat) {
			clearTimeout(self.repeatTimeout);
			self.repeatCount = 0;
		}
		self.disabled = true;
		self.active = false;
	};
	if(typeof(callback)==="function") this.Callback = callback;
	else this.Callback = function() {};
	if(typeof(onstopCallback)==="function") this.OnStop = onstopCallback;
	else this.OnStop = function() {};
	if(Utils.ValidNum(event.repeat) && event.repeat>=0) {
		this.repeatDelay = event.repeat;
		this.repeat = true;
		this.repeatCount = 0;
		this.repeatTimeout = null;
	}
	else this.repeat = false;
	this.activeButton = false;
	this.Trigger = function(button, e) {
		if(self.disabled || !self.active) return;
		if(self.repeat) {
			self.activeButton = button
			self.repeatCount++;
			self.repeatTimeout = setTimeout(function() {self.Trigger(false, self.activeButton)}, self.repeatDelay);
		}
		self.Callback(button, e);
	};
	this.Destroy = function() {
		self.active = false;
		self.Disable();
		Input.events.keypress.delete(self.id, true);
	};
	this.Start = function(button, e) {
		if(self.disabled) return;
		self.active = true;
		self.Trigger(button, e);
	};
	this.Stop = function(button, e) {
		self.active = false;
		if(self.autoDestroy) self.Destroy();
		else {
			if(self.repeat) {
				clearTimeout(self.repeatTimeout);
				self.repeatCount = 0;
			}
			self.OnStop(button, e);
		}
	};
	this.id = Input.events.keypress.push(this)-1;
};

//track inputs
$(document).ready(function() {
	//Track mouseclick
	$(document).on((Input.isMobile?"touchstart":"mousedown"), function(e) {
		if(e.type==="touchstart") var button = 1;
		else var button = e.which;
		
		if(button===1) Input.mouseStates.left = true;
		else if(button===2) Input.mouseStates.middle = true;
		else if(button===3) Input.mouseStates.right = true;
		
		for(var i=0; i<Input.events.mouseclick.length; i++) {
			var ev = Input.events.mouseclick[i];
			if(ev==undefined || ev.disabled) continue;
			if((ev.state==="down" && ev.active) || (ev.state==="up" && !ev.active)) continue;
			if(ev.button==undefined || (button===1 && ev.button==="left") || (button===2 && ev.button==="middle") || (button===3 && ev.button==="right")) {
				if(ev.preventDefault) e.preventDefault();
				if(ev.state==="down") ev.Start(["left", "middle", "right"][button-1], e);
				else ev.Stop(["left", "middle", "right"][button-1], e);
			}
		}
	});
	$(document).on((Input.isMobile?"touchend":"mouseup"), function(e) {
		if(e.type==="touchend") var button = 1;
		else var button = e.which;
		
		if(button===1) Input.mouseStates.left = false;
		else if(button===2) Input.mouseStates.middle = false;
		else if(button===3) Input.mouseStates.right = false;
		
		for(var i=0; i<Input.events.mouseclick.length; i++) {
			var ev = Input.events.mouseclick[i];
			if(ev==undefined || ev.disabled) continue;
			if((ev.state==="up" && ev.active) || (ev.state==="down" && !ev.active)) continue;
			if(ev.button==undefined || (button===1 && ev.button==="left") || (button===2 && ev.button==="middle") || (button===3 && ev.button==="right")) {
				if(ev.preventDefault) e.preventDefault();
				if(ev.state==="up") ev.Start(["left", "middle", "right"][button-1], e);
				else ev.Stop(["left", "middle", "right"][button-1], e);
			}
		}
	});
	
	//mousemove
	$(document).on(Input.isMobile?"touchmove":"mousemove", function(e) {
		var rect = document.body.getBoundingClientRect();
		Input.mouseX = (Input.isMobile?Math.round(e.originalEvent.touches[0].clientX):e.clientX) - rect.left;
		Input.mouseY = (Input.isMobile?Math.round(e.originalEvent.touches[0].clientY):e.clientY) - rect.top;
		
		for(var i=0; i<Input.events.mousemove.length; i++) {
			var ev = Input.events.mousemove[i];
			if(ev==undefined || ev.disabled) continue;
			if(ev.preventDefault) e.preventDefault();
			ev.Trigger(Input.mouseX, Input.mouseY, e);
		}
	});
	
	//mousescroll
	$(document).on("mousewheel DOMMouseScroll", function(e) {
		var scrollAmount = (/Firefox/i.test(navigator.userAgent)) ? (e.originalEvent.detail*-1):(e.originalEvent.wheelDelta/120);
		if(scrollAmount>0) var dir = "up";
		else var dir = "down";
		
		for(var i=0; i<Input.events.mousescroll.length; i++) {
			var ev = Input.events.mousescroll[i];
			if(ev==undefined || ev.disabled) continue;
			if(ev.preventDefault) e.preventDefault();
			ev.Trigger(dir, e);
		}
	});
	
	//Track key states
	$(document).on("keydown", function(e) {
		var keyID = parseInt(e.which, 10);
		Input.keyStates[keyID] = true;
		
		for(var i=0; i<Input.events.keypress.length; i++) {
			var ev = Input.events.keypress[i];
			if(ev==undefined || ev.disabled) continue;
			if(ev.button==undefined) var evKeyID = undefined;
			else var evKeyID = Input.KeyID(ev.button);
			if(keyID===evKeyID || evKeyID==undefined) {
				if(ev.preventDefault) e.preventDefault();
				if((ev.active && ev.state==="down") || (!ev.active && ev.state==="up")) continue;
				if(ev.state==="down") ev.Start(keyID, e);
				else ev.Stop(keyID, e);
			}
		}
	});
	$(document).on("keyup", function(e) {
		var keyID = parseInt(e.which, 10);
		Input.keyStates[keyID] = false;
		
		for(var i=0; i<Input.events.keypress.length; i++) {
			var ev = Input.events.keypress[i];
			if(ev==undefined || ev.disabled) continue;
			if(ev.button==undefined) var evKeyID = undefined;
			else var evKeyID = Input.KeyID(ev.button);
			if(keyID===evKeyID || evKeyID==undefined) {
				if(ev.preventDefault) e.preventDefault();
				if((ev.active && ev.state==="up") || (!ev.active && ev.state==="down")) continue;
				if(ev.state==="up") ev.Start(keyID, e);
				else ev.Stop(keyID, e);
			}
		}
	});
});

