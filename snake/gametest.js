
function Point(x,y){
	this.x = x;
	this.y = y;
}

function Rect(x,y,width, height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.x2 = this.x + this.width;
	this.y2 = this.y + this.height;
	this.corners = {
		topLeft : new Point(x, y),
		topRight : new Point(x + width, y),
		bottomLeft : new Point(x, y + height),
		bottomRight : new Point(x + width, y + height )
	};

	this.checkOverlap(rect){
		return (this.y < rect.y2 && this.y2 > rect.y)
			&& (this.x < rect.x2 && this.x2 > rect.x);
	}

	this.overlaps = function(other){
		return this.checkOverlap(other) || other.checkOverlap(this);
	}

	this.containsPoint(point){
		return (point.x >= this.x && point.x <= this.x2)
			&& (point.y >= this.y && point.y <= this.y2);
	}
}

function ViewObject(){
	this.border = null;
	this.draw = function(frame){

	}
}

function Space(origin){
	this.origin = origin;
	this.objects = {};
	this.currentId = 0;
}

function Frame(space, canvas, width, height){
	this.canvas = canvas;
	this.width = width;
	this.height = height;
	this.border = new Rect(0, 0, width, height);
	this.space = space;
	this.backColor = "white";
	this.clear = function(){

	};

	this.draw = function(){

	};

	
}

function FrameManager(frame){

}
