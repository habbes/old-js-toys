//this contains the GameWorld class that handles refreshing the world, redrawing the objects, adding and removing objects

/**
 * creates a GameWolrd on the given CartesianPlane
 */ 
function GameWorld(cartesianPlane) {
    this.objects = {};
    this.ids = {};
    this.plane = plane;

    //checks whether an id is free
    this.isIdFree = function (id) {
        return this.objects[id] == undefined || this.objects[id] == null;
    };

    //get a unique id
    this.getUniqueId = function () {
        var id;
        do {
            id = Math.random();
        } while (!this.isIdFree(id));

        return id;
    };
    
    /**
     * adds a GameObject to the GameWorld,
     * draw: (optional) whether or not to draw the object
     */
    this.addObject = function (gameObject, draw) {
        var id = this.getUniqueId();
        gameObject.id = id;
        this.objects[id] = gameObject;
        gameObject.draw(this.plane, this.plane.context);

    };

    //removes the object from the world
    this.removeObject = function (gameObject) {
        this.objects[gameObject.id] = undefined;
        this.refresh();
    };

    //clears the entire world(remove everything)
    this.clear = function () {
        this.plane.clear();
    };

    //clears world and redraws all objects
    this.refresh = function () {
        this.plane.clear();
        var obj;

        for (id in this.objects) {
            obj = this.objects[id];
            if (obj)
                this.objects[id].draw(this.plane, this.plane.context);
        }
    };
}
