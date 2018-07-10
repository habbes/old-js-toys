//describes a rectangular region that can be tracked in an AreaMap
function Region(x, y, width, height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.x2 = this.x + this.width;
	this.y2 = this.y + this.height;


	this.corners = [{x:this.x, y: this.y},
					{x:this.x2, y: this.y},
					{x:this.x, y:this.y2},
					{x:this.x2, y:this.y2}];

	this.updateCorners = function(){
		this.x2 = this.x + this.width;
		this.y2 = this.y + this.height;
		this.corners = [{x:this.x, y: this.y},
					{x:this.x2, y: this.y},
					{x:this.x, y:this.y2},
					{x:this.x2, y:this.y2}];
	}

	this.moveTo = function(x, y){
		this.x = x;
		this.y = y;
		this.updateCorners();
	}

	this.move = function(xOffset, yOffset){
		this.moveTo(this.x + xOffset, this.y + yOffset);
	}

	this.containsPoint = function(x, y){
		return (x >= this.x && x <= this.x2)
			&& (y >= this.y && y <= this.y2);
	}

	this.getArea = function(){
		return this.width * this.height;
	}

	this.checkOverlap = function(region){
		return (this.y < region.y2 && this.y2 > region.y)
			&& (this.x < region.x2 && this.x2 > region.x);
	}

	this.overlaps = function(other){
		return this.checkOverlap(other) || other.checkOverlap(this);
	}
}

//can add regions at random locations in an area without collisions or overlaps
function AreaMap(width, height){
	
	this.width = width;
	this.height = height;
	this.regions = Array();
	this.usedArea = 0;
	

	this.regionOverlaps = function(region){
		for(var i = 0; i < this.regions.length; i++){
			if(this.regions[i].overlaps(region))
				return true;
		}
		return false;
	}

	this.getRandomRegion = function(width, height, tries){
		if(typeof(tries) == "undefined")
			tries = 100;
		var maxX = this.width - width;
		var maxY = this.height - height;
		var x,y, region, counter = 0;
		do {
			x = Math.floor(Math.random() * maxX);
			y = Math.floor(Math.random() * maxY);
			region = new Region(x,y, width, height);
			counter++;
			if(counter > tries) return false;
		} while (this.regionOverlaps(region));

		return region;
	}

	this.addRandomRegion = function(w, h){
		var region = this.getRandomRegion(w, h)
		if(!region)
			return false;
		this._insertRegion(region);
		return region;
	}

	this.addRegion = function(region){
		var region = this.getRandomRegion(w, h)
		if(!region)
			return false;
		this._insertRegion(region);
		return region;
	}

	this._insertRegion = function(region){
		this.regions.push(region);
		this.usedArea += region.getArea();
	}

	this.clear = function(){
		this.usedArea = 0;
		this.regions = Array();
	}


}

function Mosaic (canvas, width, height){
	this.canvas = canvas;
	this.context = this.canvas.getContext('2d');
	this.width = width;
	this.height = height;
	this.image = null;
	this.canvasMap = new AreaMap(width, height);
	this.imageMap = null;
	this.xScale = 1;
	this.yScale = 1;
	this.avgWidth = 0;
	this.avgHeight = 0;
	this.isAvgSquare = true;
	this.maxSections = 0;
	this.deviation = 10;
	this.useOptimalSize = false;
	this.useOptimalSections = true;

	this.setImage = function(img){
		this.image = img;
		this.imageMap = new AreaMap(img.width, img.height);
		this.xScale = this.width / img.width;
		this.yScale = this.height / image.height;
	}

	//sets the average size of a section
	this.setAvgSize = function(width, height, deviation){
		this.avgWidth = width;
		this.avgHeight = height;
		this.isAvgSquare = width == height;
		this.deviation = deviation;
		this.setCorrectVariables();
	}

	this.setMaxSections = function(n){
		this.maxSections = n;
		this.setCorrectVariables();
	}

	this.setUseOptimalSize = function(bool){
		this.useOptimalSize = bool;
		this.useOptimalSections = !bool;
	}

	this.setUseOptimalSections = function(bool){
		this.useOptimalSize = !bool;
		this.useOptimalSections = bool;
	}

	this.computeMaxSections = function(avgWidth, avgHeight){
		var s1 = Math.floor(this.width / avgWidth);
		var s2 = Math.floor(this.height/ avgHeight);
		return s1 * s2;
	}

	this.computeAvgSize = function(maxSections, square){
		if(typeof(square) == "undefined")
			square = false;
		/*
		here's the math I used
		like in computeMaxSections, let's take maxSections = s1 * s2
		where s1 is the section count of the x-axis and s2 for y-axis
		==> width * height = s1 * avgw * s2 * avgh
		==>avgw * avgh = width * height/s1 * s2
		==>avgArea = width * height/maxSections (i)
		assuming avgw and avgh have the aspect ratio as width and height (when square==false)
		(avgw + avgh)/agvw = (width + height)/width
		(...)
		==>avgh = avgw[(width + height)/width - 1]
		let hwRatio (height-width ratio) be (width + height)/width - 1
		==>avgh = avgw * dimRatio (ii)
		(i) and (ii) lead to a quadratic equation that gives us
		avgw = sqrt(avgArea/hwRatio)
		and we can get avgh from (ii)
		*/
		var avgArea = this.width * this.height/maxSections;
		var w, h;
		var hwRatio = 1;

		if(!square){
			var hwRatio = ((this.width + this.height)/this.width) - 1;
		}

		w = Math.sqrt(avgArea/hwRatio);
		h = w * hwRatio;

		return {width : w, height : h};
	}

	this.computeRandomSize = function(avgSize, deviation){
		//either 0 or 2, 0 for positive, 2 for negative
		var sign = Math.floor(Math.random() * 2) * 2;

		//distance between the number and the avg
		deviation = Math.random() * deviation;
		//apply the sign
		//as in x - 0x = x   x - 2x = -x
		deviation -= sign * deviation;

		return avgSize + deviation;
	}

	this.setCorrectVariables = function(){	
		if(!this.useOptimalSize){
			this.maxSections = this.computeMaxSections(this.avgWidth, this.avgHeight);
		}
		else {
			var size = this.computeAvgSize(this.maxSections, this.isAvgSquare);
			this.avgWidth = size.width;
			this.avgHeight = size.height;
		}
	}

	this.paintRandomSection = function(shuffle){
		if(typeof(shuffle) == "undefined")
			shuffle = false;
		
		this.setCorrectVariables();

		var w = this.computeRandomSize(this.avgWidth, this.deviation)
		var h = this.computeRandomSize(this.avgHeight, this.deviation);
		var dest = this.canvasMap.addRandomRegion(w, h);
		if(!dest)
			return false;
		var source = dest;
		if(shuffle){
			source  = this.imageMap.addRandomRegion(w, h);
			if(!source)
				return false;
		}

		this._paintSection(source, dest);

	}

	this._paintSection = function(source, dest){
		//crop section of the image determined by source and paint
		//on the canvas at region determined by dest
		this.context.drawImage(this.image, source.x, source.y, source.width,
			source.height, dest.x, dest.y, dest.width, dest.height);
	}

	this.randomMosaic = function(shuffle){
		if(typeof(shuffle) == "undefined")
			shuffle = false;
		this.clear();
		this.setCorrectVariables();
		for(var i = 0; i < this.maxSections; i++){
			this.paintRandomSection(shuffle);
		}
	}

	this.clear = function(){
		if(this.imageMap)
			this.imageMap.clear();
		this.canvasMap.clear();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}