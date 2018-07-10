function Animator(context, width, height, fps){
	this.context = context;
	this.width = width;
	this.height = height;
	this.objects = [];
	this.frameLength = 1000/fps;
	this.timeout = null;
	this.lastTime = 0;
	this.startTime = 0;
}

Animator.prototype.clearScreen = function(){
	this.context.clearRect(0, 0, this.width, this.height);
}

Animator.prototype.addObject = function(obj){
	this.objects.push(obj);
}

Animator.prototype.start = function(){
	this.lastTime = Date.now();
	this.startTime = Date.now();
	this.clearScreen();
	for(var i = 0; i < this.objects.length; i++){
		this.objects[i].frame({"interval":0,"elapsed":0});
	}
	var _this = this;
	this.timeout = setTimeout(function(){_this.loop()}, _this.frameLength);
}

Animator.prototype.loop = function(){
	var now = Date.now();
	var time = {"interval":(now - this.lastTime)/1000,"elapsed":(now - this.startTime)/1000};
	this.lastTime = now;
	this.clearScreen();
	for(var i = 0; i < this.objects.length; i++){
		this.objects[i].frame(time);
	}
	var _this = this;
	this.timeout = setTimeout(function(){_this.loop()}, _this.frameLength);
}

//-- BACKGROUND
function Background(context, width, height, color){
	this.context = context,
	this.width = width;
	this.height = height;
	this.color = color;
}

Background.prototype.frame = function(){
	this.context.fillStyle = this.color;
	this.context.fillRect(0, 0, this.width, this.height);
}

//-- RAIN DROP
function RainDrop(x, y) {
	this.startX = x;
	this.startY = y;
	this.x = x;
	this.y = y;
	this.ySpeed = 12;
	this.xSpeed = 4
	this.height = 10;
	this.lenX = -1;
	this.lenY = 10;
	this.color = "";

}

RainDrop.prototype.draw = function(context){
	context.beginPath();
	context.strokeStyle = this.color;
	context.lineWidth = 1;
	context.moveTo(this.x, this.y);
	context.lineTo(this.x + this.lenX, this.y + this.lenY);
	context.stroke();
}

RainDrop.prototype.nextStep = function(time){
	this.x +=  this.xSpeed * time.interval;
	this.y +=  this.ySpeed * time.interval;
	
}

//-- RAIN
function Rain(context, width, height){
	this.bgd = "white";
	this.context = context;
	this.width = width;
	this.height = height;
	this.layers = [];
	this.drops = [];
	this.amount = 0.001;
	this.amountSpeed = 0.005;
	this.amountMin = 0.001;
	this.amountMax = 0.1;
	this.xInterval = 5;

}

Rain.prototype.addLayer = function(xSpeed, ySpeed, lenX, lenY, color, weight){
	this.layers.push({'xSpeed':xSpeed, 'ySpeed':ySpeed, 'lenX':lenX, 'lenY':lenY, 'color':color, 'weight':weight});
}

Rain.prototype.createDrops = function(){
	var dropChance;
	var layer;
	var drop;
	for(var x = 0; x < this.width; x += this.xInterval){
		dropChance = Math.random() <= this.amount;
		if(dropChance){
			layer = this.layers[Math.floor(Math.random() * this.layers.length)];
			drop = new RainDrop(x, 0 - (layer.lenY / 2));
			drop.xSpeed = layer.xSpeed;
			drop.ySpeed = layer.ySpeed;
			drop.lenX = layer.lenX;
			drop.lenY = layer.lenY;
			drop.color = layer.color;
			this.drops.push(drop);
		}
	}
}

Rain.prototype.updateAmount = function(time){
	this.amount += time.interval * this.amountSpeed;
	if(this.amount > this.amountMax || this.amount < this.amountMin){
		this.amountSpeed = -this.amountSpeed;
	}
}

Rain.prototype.drawAndStep = function(time){
	var drop;
	for(var i = 0; i < this.drops.length; i++){
		drop = this.drops[i];
		drop.draw(this.context);
		drop.nextStep(time);
		var x1 , x2;
		if(drop.x > drop.x + drop.lenX){
			 x1 = drop.x;
			 x2 = drop.x + drop.lenX;
		}
		else {
			x2 = drop.x;
			x1 = drop.x + drop.lenx;
		}
		var y1, y2;
		if(drop.y > drop.y + drop.lenY){
			y1 = drop.y; y2 = drop.y + drop.lenY;
		}
		else {
			y2 = drop.y; y1 = drop.y + drop.lenY;
		}

		if((x1 < 0 || x2 > this.width)||(y1 < 0 || y2 > this.height)){
			this.drops.splice(i,1); //remove raindrop
			--i;//objects above index i have been shifted down and length reduced
		}
	}

}

Rain.prototype.frame = function(time){
	this.updateAmount(time);
	this.createDrops();
	this.drawAndStep(time);
}



//-- GRASS STRAND
function GrassStrand(x, y,color, width){
	this.width = width;
	this.x = x;
	this.y = y;
	this.height = 0;
	this.color = color;
}

GrassStrand.prototype.draw = function(context){
	context.beginPath();
	context.strokeStyle = this.color;
	context.lineWidth = this.width;
	context.moveTo(this.x,this.y);
	context.lineTo(this.x, this.y - this.height );
	context.stroke();
}

//-- GRASS
function Grass(context, width, height){
	this.context = context;
	this.width = width;
	this.height = height;
	this.floor = height;
	this.maxHeight = 100;
	this.baseHeight = 10;
	this.heightVar = 12;
	this.baseColor = {r:100, g:200, b:100};
	this.colorVar = 10;
	this.strands = [];
	this.growSpeed = 4;
	this.strandWidth = 2;
}

Grass.prototype.newColor = function(){
	var v = -this.colorVar + Math.floor(Math.random() * 2 * this.colorVar);
	var b = this.baseColor;
	return "rgb(" + (b.r + v) + "," + (b.g + v) + "," + (b.b + v) + ")"; 
}

Grass.prototype.newStrand = function(x){
	var s = new GrassStrand(x, this.floor, this.newColor(), this.strandWidth)
	var v = Math.floor(Math.random() * (this.heightVar + 1));
	s.height = this.baseHeight + v;
	this.strands.push(s);
}

Grass.prototype.createStrands = function(){
	for(var x = 0; x < this.width; x += this.strandWidth){
		this.newStrand(x);
	}
}

Grass.prototype.drawAndGrow = function(time){

	var grow = true;
	if(this.baseHeight + this.heightVar > this.maxHeight)
		grow = false;
	else
		this.baseHeight += time.interval * this.growSpeed;
	var s;
	for(var i = 0; i < this.strands.length; i++){
		s = this.strands[i];
		s.draw(this.context);
		if(grow){
			
			//var v = Math.floor(Math.random() * (this.heightVar + 1));
			//s.height = this.baseHeight + v;
			//s.height += time.interval * this.growSpeed;
		}
		var v = Math.floor(Math.random() * (this.heightVar + 1));
		s.height = this.baseHeight + v;
	}
}

Grass.prototype.frame = function(time){
	this.drawAndGrow(time);
}

