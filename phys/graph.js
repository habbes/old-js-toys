/**
Clément 'Habbes' Habinshuti
03.10.2013

prototype for plotting functions and points on a 2d graph
*/

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
}

/**
 * creates a graph from the given canvas Context object
 * orgX : the x coord of the graph's origin in the canvas object
 * orgY : the y coord of the graph's origin in the canvas object
 * unit : the unit distance in pixels
 * x : the x coord of the graph in the canvas
 * y : the y coord of the graph in the canvas
 * context : from a canvas
 */
function Graph(orgX, orgY, unit, x, y, width, height, context){
	this.origin = new Coord(orgX, orgY);
	this.location = new Coord(x, y);
	this.unit = unit;
	this.context = context;
	this.width = width;
	this.height = height;
	this.color = "black";

	//a list of the plotted function graphs
	//used to redraw the graphs when zoomed or shifted
	this.functionGraphs = [];

	//whether to show the x or y axes and measurement markers
	this.xAxis = true;
	this.yAxis = true;
	this.markers = true;

	//whether to show borders
	this.borders = true;

	//each function has a unique id
	this.curId = 0;

	/**
	 * get the coordinates that will be used for the canvas
	 * this takes into consideration the offset of the graph's
	 * origin in the canvas and the unit measure
	 */
	this.getInnerCoord = function(coord){
		//the graph's y axis is headed up as opposed to the canvas's y direction, hence the negative
		return new Coord(coord.x * this.unit + this.origin.x, -coord.y * this.unit + this.origin.y);
	};

	/**
	 * inverse of getInnerCoord
	 */
	this.getGraphCoord = function(coord){
		return new Coord( (coord.x - this.origin.x)/this.unit, (this.origin.y - coord.y)/this.unit);
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
	 * adds a function to the list of functions to be plotted when this.plotFunctions() is called
	 * f : callable function that returns y when given the x parameter
	 * startX : optional, x to start with
	 * endX: optional, x to end with
	 * lineWidth: optional, width of the line
	 * color: optional, color of the line
	 * detail: the higher the number, the smoother and more detailed the curve is
	 * 			but the longer it takes to plot
	 */
	this.addFunction = function(f, color, startX, endX, detail, lineWidth){
		fg = {'id':++this.curId, 'f':f, 'color':color, 'startX':startX, 'endX':endX, 'detail':detail, 'lineWidth':lineWidth};

		//save the function's graph
		this.functionGraphs.push(fg);


	};

	this.getFunctionById = function(id){
		for(var i = 0; i < this.functionGraphs.length; i++)
			if(this.functionGraphs[i].id == id) return this.functionGraphs[i];

		return null;
	}


	/**
	 * forgets all saved functions
	 */
	this.clearFunctions = function(){
		this.functionGraphs = [];
	};

	/**
	 * plots function on the graph
	 * f : callable function that returns y when given the x parameter
	 * startX : optional, x to start with
	 * endX: optional, x to end with
	 * lineWidth: optional, width of the line
	 * color: optional, color of the line
	 * detail: the higher the number, the smoother and more detailed the curve is
	 * 			but the longer it takes to plot
	 */
	this.plotFunction = function(f, color, startX, endX, detail, lineWidth){
		//save's the function for future use (zooming, translation)
		this.addFunction(f, color, startX, endX, detail, lineWidth);	

		this.plotFunctionGraph(fg);		
		
	};

	/**
	 * plots a function's graph,
	 * fg : object containing information about the function's graph, including
	 * 		the function itself, color, detail, etc.
	 *		it has the following properties
	 *		f, color, startX, endX, detail, lineWidth
	 */
	this.plotFunctionGraph = function(fg){

		//default vals in case of null vars
		var startX = defVal(fg.startX, this.getMinCoord().x);
		var endX = defVal(fg.endX, this.getMaxCoord().x);
		var lineWidth = defVal(fg.lineWidth, 1);
		var color = defVal(fg.color, this.color);
		var detail = defVal(fg.detail, 20);

		this.context.beginPath();
		this.context.strokeStyle = color;
		this.context.lineWidth = lineWidth;

		var innerStart = this.getInnerCoord(new Coord(startX, fg.f(startX)));
		this.context.moveTo(innerStart.x, innerStart.y);

		/*
		if 1/unit is one pixel, detail is then the fraction of the pixel
		to use as the x delta or incrementor
		*/
		var pixelStep = 1/(this.unit * detail);


		//track whether the graph has gone beyond bounds
		var beyondHeight = false;
		var beyondZero = false;

		for(var x = startX; x <= endX; x += pixelStep){
			var coord = new Coord(x, fg.f(x));
			if(!isFinite(coord.y)){
				nextCoord = new Coord(x + pixelStep, fg.f(x + pixelStep));
				nc = this.getInnerCoord(nextCoord);
				this.context.moveTo(nc.x, nc.y);
				continue;
			}


			var c = this.getInnerCoord(coord);

			//limit graph to bounds
			if(c.y > this.location.y + this.height){
				
				if(!beyondHeight){
					beyondHeight = true;

					/*
					if the previous point was above the visible plane, and it's below
					(e.g in case of limits), do not join that point to this point, there
					will therefore be a discontinutity
					*/
					prevCoord = new Coord(x - pixelStep, fg.f(x - pixelStep));
					pc = g.getInnerCoord(prevCoord);
					if(pc.y < this.location.y){
						continue;
					}

				} else {
					c.y = this.location.y + this.height;
					this.context.moveTo(c.x, c.y);
					continue;
				}
			}

			if (c.y < this.location.y){
				
				if(!beyondZero){					
					beyondZero = true;

					prevCoord = new Coord(x - pixelStep, fg.f(x - pixelStep));
					pc = g.getInnerCoord(prevCoord);
					if(pc.y > this.location.y + this.height){
						continue;
					}

				} else {
					c.y = this.location.y;
					this.context.moveTo(c.x, c.y);
					continue;
				}
			}

			beyondHeight = false;
			beyondZero = false;

			this.context.lineTo(c.x, c.y);
			
		}

		this.context.stroke();
	};

	/**
	 * plots all saved functions
	 */
	this.plotFunctions = function(){
		for(var i=0; i < this.functionGraphs.length; i++){
			this.plotFunctionGraph(this.functionGraphs[i]);
		}
	};



	/**
	 * plots a graph from the given coordinates
	 * points: list of [x, y] coordinates
	 * color: color of the line
	 * lineWidth: the width of the line
	 */
	this.plotPoints = function(points, color, lineWidth){
		lineWidth = defVal(lineWidth, 1);
		color = defVal(color, this.color);

		//the plotted line is a sequence of point circles
		this.context.beginPath();
		this.context.strokeStyle = color;
		this.context.lineWidth = lineWidth;

		var first = points[0];
		var start = this.getInnerCoord(new Coord(first[0], first[1]));
		this.context.moveTo(first.x, first.y);

		for(var i = 0; i < points.length; i++){
			var pair = points[i];
			var c = this.getInnerCoord(new Coord(pair[0], pair[1]));
			this.context.lineTo(c.x, c.y);
			
		}

		this.context.stroke();
	};

	/**
	 * draw a point at the given coordinates on the graph
	 */
	this.drawPoint = function(coord, width){
		width = defVal(width, 1);
		if(!isFinite(coord.y)) return false;

		this.context.beginPath();
		radius = width/2;
		c = this.getInnerCoord(coord);
		this.context.arc(c.x, c.y, radius, 0, 2 * Math.PI);
		this.context.fill();

	};

	/**
	 * clears the graph
	 */
	this.clear = function(){
		this.context.clearRect(this.location.x, this.location.y, this.width, this.height);

		if(this.borders){
			this.drawBorders();
		}

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

		

	};

	/**
	 * clears the graph and replots
	 */
	this.refresh = function(){
		this.clear();
		this.plotFunctions();
	};

	/**
	 * draw the x axis
	 */
	this.drawXAxis = function(){
		this.context.beginPath();
		this.context.strokeStyle = this.color;
		this.context.lineWidth = 1;
		this.context.moveTo(this.location.x, this.origin.y);
		this.context.lineTo(this.location.x + this.width, this.origin.y);
		this.context.stroke();

	};

	/**
	 * hides the x axis if its visible or vice versa
	 */
	this.toggleXAxis = function(){
		this.xAxis = !this.xAxis;
		this.refresh();
	};

	/**
	 * draw the y axis
	 */
	this.drawYAxis = function(){
		this.context.beginPath();
		this.context.strokeStyle = this.color;
		this.context.lineWidth = 1;
		this.context.moveTo(this.origin.x, this.location.y);
		this.context.lineTo(this.origin.x, this.location.y + this.height);
		this.context.stroke();
	};

	/**
	 * hide the y axis if its visible or vice versa
	 */
	this.toggleYAxis = function(){
		this.yAxis = !this.yAxis;
		this.refresh();
	};

	/**
	 * hide both axes
	 */
	this.hideAxes = function(){
		this.xAxis = false;
		this.yAxis = false;
		this.refresh()
	};

	/**
	 * show both axes
	 */
	this.showAxes = function(){
		this.xAxis = true;
		this.yAxis = true;
		this.refresh()
	};

	/**
	 * put measurement markers on x axis
	 */
	this.drawXMarkers = function(){
		//the height of the markers
		var height = 3;
		this.context.beginPath();
		this.context.strokeStyle = this.color;
		this.context.lineWidth = 0.5;

		var start = this.getMinCoord();
		var end = this.getMaxCoord();


		//take the bigger of the starting and ending x's on the graph
		var limit = Math.abs((Math.abs(start.x) > Math.abs(end.x))? start.x : end.x);


		//draw small parallel lines accross the x axis at unit intervals
		for(var x=0; x <= limit; x++){
			var posc = this.getInnerCoord(new Coord(x, 0));
			var negc = this.getInnerCoord(new Coord(-x, 0));
	
			//put a marker in the positive direction if there is still room
			if(x <= Math.abs(end.x)){
				this.context.moveTo(posc.x, this.origin.y - height);
				this.context.lineTo(posc.x, this.origin.y + height);
			}

			//same for the negative side
			if(x <= Math.abs(start.x)){
				this.context.moveTo(negc.x, this.origin.y - height);
				this.context.lineTo(negc.x, this.origin.y + height);
				
			}
		}

		this.context.stroke();	

	}; //end drawXMarkers

	/**
	 * put measurement markers on y axis
	 */
	this.drawYMarkers = function(){
		//the length of the markers
		var length = 3;
		this.context.beginPath();
		this.context.strokeStyle = this.color;
		this.context.lineWidth = 0.5;

		var start = this.getMinCoord();
		var end = this.getMaxCoord();


		//take the bigger of the starting and ending y's on the graph
		var limit = Math.abs((Math.abs(start.y) > Math.abs(end.y))? start.y : end.y);
		
		//draw small parallel lines accross the y axis at unit intervals
		for(var y=0; y <= limit; y++){
			//coord for  marker on the positive side of the axis
			var posc = this.getInnerCoord(new Coord(0, y));
			//coord on the negative side
			var negc = this.getInnerCoord(new Coord(0, -y));

			//put a marker in the positive direction if there is still room
			if(y <= Math.abs(end.y)){
				this.context.moveTo(this.origin.x - length, posc.y);
				this.context.lineTo(this.origin.x + length, posc.y);
			}

			//same for the negative side
			if(y <= Math.abs(start.y)){
				this.context.moveTo(this.origin.x - length, negc.y);
				this.context.lineTo(this.origin.x + length, negc.y);				
			}
		}

		this.context.stroke();	

	}; //end drawYMarkers

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
	 * zoom by the given factor
	 */
	this.zoom = function(factor){
		factor = defVal(factor, 1);
		//0 does not make sense, and will make it crush
		if(factor == 0) factor = 1;

		this.unit *= factor;
		this.refresh();
	};

	
	/**
	 * move the origin to a new point relative to the curren origin's loction
	 * deltaX: the x distance from the origin to move to
	 * delatY: the y distance from the origin to move to
	 */
	this.moveOrigin = function(deltaX, deltaY){
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