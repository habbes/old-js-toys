/**
Clément 'Habbes' Habinshuti
10.10.2013

Cartesian Plane

Used to place objects on a cartesian plane. The Plane object
will be responsible of converting between normal cartesian coordinate
system and the computer graphics coordinate system (origin at top left, 
y axis goes down), it will allow for translating or shifting of the plane,
modifying the unit size (zooming) and other functions.

This contains a lot of the code already in Graph (graph.js) used for plotting
functions and points. Had I done this prior, I should have based Graph on this
instead and have this as the basis of subsequent works requiring a 2D
Cartesian Plane (maybe I should extend or generalize to allow 3D)

*/


//self explanatory, helper function
function isNull(x){
	return (x == null);
}

/**
 * returns a default value if the variable is null
 * otherwise the var itself
 * x : the variable
 * def : the default value
 */
function defVal(x, def){
	return isNull(x)? def : x;
}

/**
 * creates an x, y coordinate pair
 */
function Coord(x, y){
	x = defVal(x, 0);
	y = defVal(y, 0);

	this.x = x;
	this.y = y;

	this.copy = function () {
	    return new Coord(this.x, this.y);
	}

	
}


/**
 * creates a Cartesian Plane from the given canvas context object
 * context : from canvas
 * x : the x position of the plane in the canvas
 * y : the y position of the plane in the canvas
 * orgX : the x-coordinate of the plane's origin in the canvas
 * orgY : the y-coordinate of the plane's origin in the canvas
 * width : the width of the plane
 * height : the height of the plane
 * xunit : the unit (subdivision) x-distance in pixels
 * yunit : the unit (subdivision) y-distance in pixels
 * xunitVal : the value or measure of a single x-unit subdivision
 * yunitVal : the value or measure of a single y-unit subdivision
 */
function CartesianPlane(context, x, y, width, height, orgX, orgY, xunit, yunit, xunitVal, yunitVal){
	this.context = context;
	this.origin = new Coord(orgX, orgY);
	this.location = new Coord(x, y);
	this.width = width;
	this.height = height;
	this.xunit = defVal(xunit, 10);
	this.yunit = defVal(yunit, 10);
	this.xunitVal = defVal(xunitVal, 1);
	this.yunitVal = defVal(yunitVal, 1);


	this.color = "black";
	//whether to show borders
	this.borders = true;


	/**
	 * get the coordinates that will be used for the canvas
	 * this takes into consideration the offset of the graph's
	 * origin in the canvas and the unit measure
	 */
	this.getInnerCoord = function(coord){
		//the graph's y axis is headed up as opposed to the canvas's y direction, hence the negative
		return new Coord(coord.x / this.xunitVal * this.xunit + this.origin.x, -coord.y / this.yunitVal * this.yunit + this.origin.y);
	};

	/**
	 * inverse of getInnerCoord
	 */
	this.getGraphCoord = function(coord){
		return new Coord( (coord.x - this.origin.x) * this.xunitVal / this.xunit, (this.origin.y - coord.y) * this.yunitVal / this.yunit);
	};

	/**
	 * get the top left coord of the graph
	 */
	this.getMinCoord = function(){
		return this.getGraphCoord(new Coord(this.location.x, this.location.y));
	};

	/**
	 * get the bottom right coord of the graph
	 */
	this.getMaxCoord = function(){
		return this.getGraphCoord(new Coord(this.location.x + this.width, this.location.y + this.height));
	};

	/**
	 * clears the graph
	 */
	this.clear = function(){
		this.context.clearRect(this.location.x, this.location.y, this.width, this.height);

		if(this.borders){
			this.drawBorders();
		}
		/*

		if(this.xAxis){
			this.drawXAxis();
			if(this.markers){
				this.drawXMarkers();
			}
		}
		if(this.yAxis){
			this.drawYAxis();
			if(this.markers){
				this.drawYMarkers();
			}
		}

		*/

	};

	/**
	 * clears the graph and replots
	 */
	this.refresh = function(){
		this.clear();
		//this.plotFunctions();
	};


	/**
	 * draw borders arount the cartesian plane
	 */
	this.drawBorders = function(){
		this.context.beginPath();
		this.context.rect(this.location.x, this.location.y, this.width, this.height);
		this.context.strokeStyle = this.color;
		this.context.lineWidth = this.lineWidth;
		this.context.stroke();
	};

	/**
	 * hide borders if they are visible or vice versa
	 */
	this.toggleBorders = function(){
		this.borders = !this.borders;
		this.refresh();
	};

	/**
	 * zoom by horizontally and vertically by the
	 * given x and y factors respectively
	 */
	this.zoom = function(factorX, factorY){
		factorX = defVal(factorX, 1);
		factorY = defVal(factorY, 1);
		if(factorX == 0) factorX = 1;
		if(factorY == 0) factorY = 1;

		this.xunit *= factorX;
		this.yunit *= factorY;
		this.refresh();
	};

	/**
	 * zoom horizontally and vertically by the given factor
	 */
	this.zoomBoth = function(factor){
		this.zoom(factor, factor);
	};

	/**
	 * move the origin to a new point relative to the curren origin's loction
	 * deltaX: the x distance from the origin to move to
	 * delatY: the y distance from the origin to move to
	 */
	this.moveOrigin = function(deltaX, deltaY){
		deltaX = defVal(deltaX, 0);
		deltaY = defVal(deltaY, 0);
		c = this.getInnerCoord(new Coord(deltaX, deltaY));
		this.origin.x = c.x;
		this.origin.y = c.y;
		this.refresh();
	};

	/**
	 * moves the plane along the x axis with respect to current origin's coordinates
	 * deltaX : the x distance from the origin to move to
	 */
	this.moveX = function(deltaX){
		this.moveOrigin(deltaX, 0);
	};

	/**
	 * moves the plane along the y axis with respect to current origin's coordinates
	 * deltaY : the y distance from the origin to move to
	 */
	this.moveY = function(deltaY){
		this.moveOrigin(0, deltaY);
	};

	/**
	 * initializer function (called at the end of this function)
	 */
	this.init = function(){
		this.clear()
	};

	//initialize
	this.init();

	



}