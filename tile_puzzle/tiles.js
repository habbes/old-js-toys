// Sliding Tiles Game
// By Habbes

//debugging, remove wenn done
/*
var f = new Grid(3,3,Array(4,7,2,8,6,1,3,5,null));
var g = new Grid(3,3);
var h = new Grid(3,3,[1,2,3,4,5,6,7,8,null]);
var i = new Grid(2,3,[3,5,null,2,1,4]);
*/

//var selectedTile = null;

//GLOBAL PROPERTIES
var gameboard;
var time;
var timinterval;
var isRunning;
var moves;

//EVENTS
var ontimetick; // raised when the game timer ticks
var ongamesolved; //when the puzzle is solved
var ongamestop; //when the game is stopped
var onmove; //when a tile is moved

function raiseOntimetick(time){
	var evt = {time:time};
	if (ontimetick) ontimetick(evt);
}

function raiseOngamesolved(time,moves){
	var evt = {time:time,moves:moves};
	if (ongamesolved) ongamesolved(evt);
}

function raiseOngamestop(time,moves){
	var evt = {time:time,moves:moves};
	if (ongamestop) ongamestop(evt);
}

function raiseOnmove(sourcetile,targettile,moves){
	var evt = {sourceTile:sourcetile,targetTile:targettile,moves:moves};
	if (onmove) onmove(evt);
}






function newGame(board,rows,cols){
	if (isRunning){
		stopGame()//clear anything from an ongoing game
	}
	var grid;	
	do {
		grid = new Grid(rows,cols);
	} while (grid.checkWin());
	//do not generate a solved grid
	
	initGameBoard(board,grid);
	
	time = 0;
	moves = 0;
	isRunning = true;	
	timeinterval = setInterval(timeTick,1000);
}

function timeTick(){
	time++;
	raiseOntimetick(time);
}

function stopGame(){
	clearInterval(timeinterval);		
	isRunning = false;
	raiseOngamestop(time,moves);
}


function initGameBoard(board,grid){	
	//x = document.getElementById("board");	
	board.innerHTML = "";	
	gridnode = document.createElement("DIV");
	gridnode.setAttribute("id","grid");
	gridnode.grid = grid;	
	board.appendChild(gridnode);
	board.gridnode = gridnode;
	gameboard = board;	
	initGameGrid(gridnode);
}

function initGameGrid(gridnode){	
	var grid = gridnode.grid;
	var tiles = grid.tiles;	
	var tilenode;
	var rownode;
	for (var row=0;row<tiles.length;row++){
		rownode = document.createElement("DIV");
		rownode.className = "row";
		for (var col = 0;col<grid.cols;col++){
			tilenode = document.createElement("DIV");
			tilenode.className = "tile";			
			tilenode.tile = grid.tileAt(col,row);	
			tilenode.tile.node = tilenode;		
			tilenode.updateVal = updateVal;
			tilenode.updateVal();
			if (tilenode.tile.isEmpty()){
				tilenode.id = "empty";	
			}
			tilenode.onclick = onTileClick;			
			rownode.appendChild(tilenode);
						
		}
		gridnode.appendChild(rownode);
	}	
}

function updateVal(){	
	//update the val of the Tile's HTML div
	val = "";
	
	if (this.tile.value)val = this.tile.value;		
	this.innerHTML = val;	
}

function onTileClick(){
	if (isRunning){
		selectTile(this);
	}
}
/* This version requires one to select a tile
and then select the location where to move it
function selectTile(tilenode){	
	if (selectedTile){
		selectedTile.id = "";
		if (!selectedTile.tile.coord.equals(tilenode.tile.coord)){
			if (moveTile(selectedTile,tilenode)){
				selectedTile.updateVal();				
				tilenode.updateVal();
				selectedTile = null;
				setMessage("");
				return;
			}
		}		
	}
	selectedTile = tilenode;
	selectedTile.id = "selected";			
}

function moveTile(current,target){
	//check whether target is empty or targets are not adjacent
	if ((!target.tile.isEmpty()) || (!gameboard.gridnode.grid.areAdjacent(current.tile,target.tile))){		
		setMessage("Invalid move");
		return false;	
	}	
	gameboard.gridnode.grid.switchTiles(current.tile,target.tile)	
	setMessage("")
	return true;
}

*/

/* This version moves the tile automatically */
function selectTile(tilenode){	
	moveTile(tilenode.tile);		
}

function moveTile(tile){
	adj = gameboard.gridnode.grid.findAdjacent(tile.coord.x,tile.coord.y);	
	for (var i=0;i<adj.length;i++){
		if (adj[i].isEmpty()){
			gameboard.gridnode.grid.switchTiles(tile,adj[i]);
			tile.node.updateVal();
			adj[i].node.updateVal();
			tile.node.id="empty";
			adj[i].node.id = "";
			moves++;//one more move made
			raiseOnmove(tile,adj[i],moves);		
			if (gameboard.gridnode.grid.checkWin()){
				//puzzle solved!
				stopGame();
				raiseOngamesolved(time,moves);				
			}
			return;	
		}
	}
}



// OBJECT PROTOTYPES

function Coord(x,y){
	this.x = x;
	this.y = y;
	
	this.getCoord = function(xdelta,ydelta){
		return new Coord(this.x + xdelta,this.y + ydelta);};
		
	this.up = function(ydelta){
		return this.getCoord(0,ydelta);};
		
	this.down = function(ydelta){
		return this.getCoord(0,-(ydelta));};
		
	this.right = function(xdelta){
		return this.getCoord(xdelta,0);};
		
	this.left = function(xdelta){
		return this.getCoord(-(xdelta),0);};
		
	this.toString = function(){
		return "(" + this.x + "," + this.y + ")";};
		
	this.equals = function(other){
		return (this.x == other.x && this.y == other.y);};		
}//Coord

function Tile(x,y,val){	
	this.coord = new Coord(x,y);
	this.getX = function() {return this.coord.x;};
	this.getY = function() {return this.coord.y;};
	this.value = val;
	this.checkRight = checkRight;
	this.checkLeft = checkLeft;
	this.checkUp = checkUp;
	this.checkDown = checkDown;
	this.isEmpty = function(){return (this.value==null);};
	this.empty = function(){this.val=null;};
	this.toString = toString;
	function checkRight(){
		return 	this.coord.right(1);
	}
	
	function checkLeft(){
		return 	this.coord.left(1);
	}
	//for the purpose of this game, i will switch the meaning
	// of up and down in the Tile, since the Coord object uses the
	// usual geometrical graph orientation (y ascends as it goes up)
	// but the Grid object uses a different one (y ascends as it goes down)
	// making the change here means  I don't have to temper with the other object prototypes
	function checkUp(){
		return 	this.coord.down(1);
	}
	
	function checkDown(){
		return 	this.coord.up(1);
	}
	
	function toString(){
		var val = "empty";
		if (this.value)val =this.value;
		var str = "[Value: " + val + " Coords:"+ this.coord.toString() + "]";
		return str;	
	}
}//Tile

function Grid(rows,cols,vals){
	console.log("rows:",rows, "cols:",cols);
	this.tiles = [];
	this.rows = rows;
	this.cols = cols;
	this.maximum = this.rows * this.cols - 1;
	this.setUp = setUp;	
	this.setUpRandom = setUpRandom2;
	this.setUpGiven = setUpGiven;
	this.tileAt = tileAt;
	this.getTiles = getTiles;
	this.getValues = getValues;
	this.toString = toString;
	this.move = move;
	this.moveUp = moveUp;
	this.moveDown = moveDown;
	this.moveLeft = moveLeft;
	this.moveRight = moveRight;
	this.switchTiles = switchTiles;
	this.checkWin = checkWin;
	this.findAdjacent = findAdjacent;
	this.areAdjacent = areAdjacent;
	
	
	function setUp(vals){
		if (!vals){			
			this.setUpRandom();
		} else {
			this.setUpGiven(vals);
		}
	}
	
	function setUpRandom(){		
		var maximum = this.maximum;
		
		var usedNums = new Array(maximum+2);
		var col=[],val;
		for (var r=0;r<this.rows;r++){
			for (var c=0;c<this.cols;c++){				
				do {
					val = Math.floor(Math.random()*(maximum+1)) + 1;
				} while (usedNums[val]);
				usedNums[val] = true;
				if (val>maximum)val=null;//a random cell will be empty										
				col.push(new Tile(c,r,val));
			}
			this.tiles.push(col);
			col = [];			
		}
	}//setUpRandom()

	function setUpRandom2(){
		var maximum = this.maximum;
		var col=[], val, num = 1;
		for(var r = 0; r < this.rows; r++){
			for(var c = 0; c < this.cols; c++){
				val = (num <= maximum)? num++ : null;
				col.push(new Tile(c,r,val));
			}
			this.tiles.push(col);
			col = [];
		}
		
		//move tiles at random
		var empty = this.tileAt(this.cols-1, this.rows-1);
		var adjacents = this.findAdjacent(empty.getX(), empty.getY());
		var tile = adjacents[Math.floor(Math.random() * adjacents.length)];
		var switched = this.switchTiles(empty, tile);
		var temp;
		for(var i = 0; i < (this.rows * this.cols)* 2; i++){
			tile = switched[0];
			empty = switched[1];
			adjacents = this.findAdjacent(empty.getX(), empty.getY());
			do{
				temp = adjacents[Math.floor(Math.random() * adjacents.length)];
			}while(temp.getX() == tile.getX() && temp.getY() == tile.getY());
			tile = temp;
			switched = this.switchTiles(empty, tile);
		}
	}
		
	function setUpGiven(vals){		
		
		var col=[],val;
		for (var r=0;r<this.rows;r++){
			for (var c=0;c<this.cols;c++){										
				val = vals[r * cols + c];									
				col.push(new Tile(c,r,val));
			}
			this.tiles.push(col);
			col = [];			
		}		
	}
	
	function tileAt(x,y){
		if ((x>=0 && x<this.cols) && (y>=0 && y<this.rows)){
			return this.tiles[y][x];
		}
		return null;
	}
	
	function getTiles(){
		var tiles = [];
		for (var r=0;r<this.rows;r++){
			for (var c=0;c<this.cols;c++){
				tiles.push(this.tiles[r][c]);
			}
		}
		return tiles;
	}
	
	function getValues(){
		var vals = [];
		for (var r=0;r<this.rows;r++){
			for (var c=0;c<this.cols;c++){
				vals.push(this.tiles[r][c].value);
			}
		}
		return vals;
	}
	
	function toString(){
		var str="";
		var v;
		var tile;
		for (var i=0;i<this.tiles.length;i++){
			for (var c=0;c<this.tiles[i].length;c++){
				tile = this.tiles[i][c];
				v = "empty";
				if (tile.value){
					v = tile.value;					
				}
				str += v + " ";
			}
			str += "\n";
		}
		return str;
	}
	
	function move(x,y,dir){
		//this actually moves the values, not the tiles
		tile = this.tileAt(x,y);
			
		if (tile){
			var otherCoord;	
			switch (dir){
				case "up":
					otherCoord = tile.checkUp();
					break;
				case "down":
					otherCoord = tile.checkDown();
					break;
				case "left":
					otherCoord = tile.checkLeft();
					break;
				case "right":
					otherCoord = tile.checkRight();	
			}
			other = this.tileAt(otherCoord.x,otherCoord.y);
			if (other) {				
				this.switchTiles(tile,other);
				return [tile,other];
			}
			
		}
		return false;
		
	}
	
	function moveUp(x,y){
		return this.move(x,y,"up");
	}
	
	function moveDown(x,y){
		return this.move(x,y,"down");
	}
	
	function moveLeft(x,y){
		return this.move(x,y,"left");
	}
	
	function moveRight(x,y){
		return this.move(x,y,"right");
	}
	
	function switchTiles(t1,t2){		
		var v = t1.value;
		t1.value = t2.value;
		t2.value = v;
		return [t1, t2];
	}
	
	function checkWin(){
		vals = this.getValues();
		for (var i=0;i<this.maximum;i++){			
			if (vals[i] !== i+1){
				return false;	
			}
		}
		return true;	
	}
	
	function findAdjacent(x,y){		
		var tile = this.tileAt(x,y);
		var adjacent = [];
		var coords = [tile.checkUp(),tile.checkDown(),tile.checkLeft(),tile.checkRight()];
		for (var i=0; i<coords.length;i++){
			if (this.tileAt(coords[i].x,coords[i].y)){
				adjacent.push(this.tileAt(coords[i].x,coords[i].y));
			}
		}
		return adjacent;
	}
	
	function areAdjacent(t1,t2){
		adjacent = this.findAdjacent(t1.coord.x,t1.coord.y);
		c2 = t2.coord;
		for (var i=0;i<adjacent.length;i++){
			if (c2.equals(adjacent[i].coord)){
				return true;	
			}
		}
		return false;
	}
	
	//set up the grid with tiles
	this.setUp(vals);
}