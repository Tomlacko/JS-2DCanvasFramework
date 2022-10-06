var G = {};

//Preload Scripts
G.PreloadScripts = function(callback, scripts) {
	var loadedScripts = 0;
	var numScripts = scripts.length;
	if(numScripts===0) {
		setTimeout(callback, 0);
		return;
	}
	for(var i=0; i<scripts.length; i++) {
		var s = scripts[i];
		Utils.LoadScript(s, function(result) {
			if(result!==true) {
				//console.warn("Script failed to load: \""+this.src+"\"");
			}
			if(++loadedScripts>=scripts) setTimeout(callback, 0);
		});
	}
};

//Get RGB color format - (255, 255, 255)
function RGB(r, g, b) {
	return "rgb("+r+", "+g+", "+b+")";
};

//Get RGBA color format (transparency) - (255, 255, 255, 1)
function RGBA(r, g, b, a) {
	return "rgba("+r+", "+g+", "+b+", "+a+")";
};

//Convert HSV to RGB (alpha only passes through)
G.HSVtoRGB = function(h, s, v, a) {
	var i = Math.floor(h*6);
	var f = h*6 - i;
	var p = v*(1 - s);
	var q = v*(1 - f*s);
	var t = v*(1 - (1-f)*s);
	var r, g, b;
	switch(i%6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return {r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255), a:a};
};

//Create canvas font style
G.FontStyle = function(size, bold, italic, font) {
	var style = "";
	if(italic===1) style=style+"italic ";
	else if(italic===2) style=style+"oblique ";
	if(bold===1) style=style+"bold ";
	else if(bold===2) style=style+"900 ";
	style=style+size+"px ";
	if(font) style=style+font;
	else style=style+"Arial";
	//return {style:style, size:size};
	return style;
};

G.FpsToTime = function(fps, gamefps) {
	if(Utils.ValidNum(gamefps)) return (1000/gamefps)*fps;
	else return 1000/fps;
};

/////////

//GET DISTANCE
G.GetDist = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
};

//GET DISTANCE SQUARED (no square-root)
G.GetDistNoSqrt = function(x1, y1, x2, y2) {
	var x = x2-x1;
	var y = y2-y1;
	return x*x + y*y;
};

//GET ANGLE BETWEEN TWO POINTS / VECTORS (degrees)
G.GetAngle = function(cX, cY, x, y) {
	var a = Math.atan2(y-cY, x-cX);
    return Math.toDeg(a).fixedTo(15);;
};

//GET POINT FROM ANGLE AND DISTANCE (degrees)
G.PointAtAngle = function(cX, cY, angle, dist) {
	angle = Math.toRad(angle);
	var x = (dist*Math.cos(angle)+cX).fixedTo(15);
	var y = (dist*Math.sin(angle)+cY).fixedTo(15);
	return {x:x, y:y};
};
	
//////////////////////

//CIRCLE - CIRCLE collision
G.IntersectCircleCircle = function(x1, y1, r1, x2, y2, r2) {
	return G.GetDist(x1, y1, x2, y2) < (r1+r2);
};

//RECTANGLE - RECTANGLE collision
G.IntersectRectRect = function(x1, y1, w1, h1, x2, y2, w2, h2) {
	return (x1>x2-w2-w1 && x1<x2+w2+w1 && y1>y2-h2-h1 && y1<y2+h2+h1);
};

//RECTANGLE - CIRCLE collision
G.IntersectRectCircle = function(x, y, w, h, cx, cy, r) {
	var top = y-h;
	var bottom = y+h;
	var left = x-w;
	var right = x+w;
	var closestX = (cx<left? left:(cx>right? right:cx));
	var closestY = (cy<top? top:(cy>bottom? bottom:cy));
	var dx = closestX-cx;
	var dy = closestY-cy;
	return (dx*dx + dy*dy) < r*r;
};

//Find if given point is within given circle's radius
G.IsPointInCircle = function(x, y, cx, cy, r) {
	return G.GetDistNoSqrt(x, y, cx, cy) < r*r;
};

//Find if given point is inside rectangle 
G.IsPointInRect = function(x, y, cx, cy, w, h) {
	return (x>cx-w && x<cx+w && y>cy-h && y<cy+h);
};

//Find if given point is inside rectangular area (defined by top-left and bottom-right)
G.IsPointInArea = function(x, y, x1, y1, x2, y2) {
	return (x>x1 && x<x2 && y>y1 && y<y2);
};

//LINE - LINE intersection point
G.IntersectLineLine = function(Ax1, Ay1, Ax2, Ay2, Bx1, By1, Bx2, By2, side) {
	var dn = ((By2-By1)*(Ax2-Ax1)) - ((Bx2-Bx1)*(Ay2-Ay1));
	if(dn===0) return false;
	var a = Ay1-By1;
	var b = Ax1-Bx1;
	var n1 = ((Bx2-Bx1)*a) - ((By2-By1)*b);
	var n2 = ((Ax2-Ax1)*a) - ((Ay2-Ay1)*b);
	a = n1/dn;
	b = n2/dn;
	if(a>=0 && a<=1 && b>=0 && b<=1) {
		var result = {x:Ax1+(a*(Ax2-Ax1)), y:Ay1+(a*(Ay2-Ay1))};
		if(side!=undefined) result.side = side;
		return result;
	}
	else return false;
};

//LINE - CIRCLE intersection point
G.IntersectLineCircle = function(x1, y1, x2, y2, cx, cy, r) {
	var lineLength = G.GetDist(x1, y1, x2, y2);
	var result = false;
	
	//if line starts inside circle, return false
	if(G.GetDistNoSqrt(x1, y1, cx, cy)<r*r-1) return false;
	
	//direction vector from A to B
	var Dx = (x2-x1)/lineLength;
	var Dy = (y2-y1)/lineLength;
	
	
	//line equation is   x = Dx*t + Ax
	//0<= t <=1          y = Dy*t + Ay
	
	//calculate t for closest point to circle center
	var t = Dx*(cx-x1) + Dy*(cy-y1);
	//This is the projection of C on the line from A to B.
	
	//calculate closest point on line to circle center
	var Ex = t*Dx+x1;
	var Ey = t*Dy+y1;
	
	//distance of line to circle center
	var lineDistance = G.GetDist(Ex, Ey, cx, cy);
	
	//test if the line intersects circle
	if(lineDistance<r) {
		//distance from circle center to intersection points
		var dt = Math.sqrt(r*r - lineDistance*lineDistance);
		
		//first intersection point
		var Fx = (t-dt)*Dx+x1;
		var Fy = (t-dt)*Dy+y1;
		
		result = {x:Fx, y:Fy};
		
		//second intersection point
		//var Gx = (t+dt)*Dx+x1;
		//var Gy = (t+dt)*Dy+y1;
	}
	//if line is tangent to circle
	else if(lineDistance===r) result = {x:Ex, y:Ey};
	
	return result;
};

//LINE - RECTANGLE intersection point
G.IntersectLineRect = function(x1, y1, x2, y2, cx, cy, w, h) {
	var rx1 = cx-w;
	var ry1 = cy-h;
	var rx2 = cx+w;
	var ry2 = cy+h;
	var result = false;
	if(x1<=rx1) {//left
		if(y1<=ry1) {//top
			result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry1, rx2, ry1, "top");
			if(result===false) result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry1, rx1, ry2, "left");
		}
		else if(y1>=ry2) {//bottom
			result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry2, rx2, ry2, "bottom");
			if(result===false) result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry1, rx1, ry2, "left");
		}//mid
		else result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry1, rx1, ry2, "left");
	}
	else if(x1>=rx2) {//right
		if(y1<=ry1) {//top
			result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry1, rx2, ry1, "top");
			if(result===false) result = G.IntersectLineLine(x1, y1, x2, y2, rx2, ry1, rx2, ry2, "right");
		}
		else if(y1>=ry2) {//bottom
			result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry2, rx2, ry2, "bottom");
			if(result===false) result = G.IntersectLineLine(x1, y1, x2, y2, rx2, ry1, rx2, ry2, "right");
		}//mid
		else result = G.IntersectLineLine(x1, y1, x2, y2, rx2, ry1, rx2, ry2, "right");
	}
	else {//mid
		if(y1<=ry1) result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry1, rx2, ry1, "top");
		else if(y1>=ry2) result = G.IntersectLineLine(x1, y1, x2, y2, rx1, ry2, rx2, ry2, "bottom");
		//else result = false;//inside
	}
	return result;
};