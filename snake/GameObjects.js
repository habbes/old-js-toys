// This file contains the classes for the different game objects, since I don't how to create
// abstract classes and inheritance, I'll create all the objects here

//model

function GameObject(x, y, width, height, draw, hide) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.draw = draw;
    this.hide = hide;
    this.id = 0; //this uniquely identifies the object in the game world and is set by the game world
    
}

function Snake(x, y, size, direction) {
    this.x = x;
    this.y = y;
    this.width = 1;
    this.height = 1;
    this.length = 1;

}
