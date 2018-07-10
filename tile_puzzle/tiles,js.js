// Sliding Tiles Game
// By Habbes

function Coord(x,y){
	this.x = x;
	this.y = y;
	this.getCoord = function(xdelta,ydelta){
		return new Coord(this.x + xdelta,this.y + ydelta);};
	this.up = function(ydelta){
		return this.getCoord(0,xdelta);};
	this.down = function(ydelta){
		return this.getCoord(0,-(ydelta));};
	this.right = function(xdelta){
		return this.getCoord(xdelta,0);};
	this.left = function(xdelta){
		return this.getCoord(-(xdelta),0);};
	
		
}

function Tile(element,x,y,val){
	this.element = element;
	this.coord = new Coord(x,y);
	this.val = val;
	this.checkRight = checkRight();
	this.checkLeft = checkLeft();
	this.checkUp = checkUp();
	this.checkDown = checkDown();
	this.isEmpty = function(){return (val==null);};
	
	function checkRight(){
		return 	
	}
}