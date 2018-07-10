// JavaScript source code

function Snake(x, y, size, direction) {
    this.coord = new Coord(x, y);
    this.size = size;
    this.direction = direction;

    this.head = new SnakeBlock(x, y, null, null);
    

   

    this.getTail = function () {
        var t = this.head;
        while (t.tail != null) {
            t = t.tail;
        }

        return t;
    }

    this.grow = function () {
        var t = this.getTail();
        var th = t.head;
        //t.tail = new SnakeBlock(t.coord.x + 1, t.coord.y, t, null);
        var coord;
        if (th) console.log(th.coord);
        console.log(t.coord);
        if ( (th) && th.coord.y == t.coord.y) {
            if (th.coord.x < t.coord.x) {
                coord = new Coord(t.coord.x + 1, t.coord.y);
            } else {
                coord = new Coord(t.coord.x - 1, t.coord.y);
            }

        } else if ( (th) && th.coord.x == t.coord.x) {
            if (th.coord.y > t.coord.y) {
                coord = new Coord(t.coord.x, t.coord.y - 1);
            } else {
                coord = new Coord(t.coord.x, t.coord.y + 1);
            }
        } else {
            if (this.direction == "left") {
                coord = new Coord(t.coord.x + 1, t.coord.y);
            }

            switch (this.direction) {
                case "left":
                    coord = new Coord(t.coord.x + 1, t.coord.y);
                    break;

                case "up":
                    coord = new Coord(t.coord.x, t.coord.y - 1);
                    break;

                case "right":
                    coord = new Coord(t.coord.x -1, t.coord.y);
                    break;

                case "down":
                    coord = new Coord(t.coord.x, t.coord.y + 1);
                    break;
            }
        }

        t.tail = new SnakeBlock(coord.x, coord.y, t, null);
        
    }

    this.move = function () {
        var lastCoord = this.head.coord.copy();
        switch (this.direction) {
            case "up":
                this.head.coord.y += 1;
                break;

            case "down":
                this.head.coord.y -= 1;
                break;

            case "right":
                this.head.coord.x += 1;
                break;

            case "left":
                this.head.coord.x -= 1;
                break;
        }

        var t = this.head.tail;
        var temp;
        //console.log(this.head.coord);
        while (t != null) {
            temp = t.coord;
            t.coord = lastCoord;
            lastCoord = temp.copy();
            //console.log(t.coord);
            t = t.tail;
            
        }
    }

    this.draw = function (plane, context) {
        
        var b = this.head;
        //console.log(plane, context);
        
       

        while (b != null) {
            b.draw(plane, context);
            b = b.tail;
        }
        
    }



    this.head = new SnakeBlock(x, y);


    function SnakeBlock(x,y, head, tail) {
        this.coord = new Coord(x, y);
        
        this.draw = function (plane, context) {
            
            //console.log(this.coord);
            context.beginPath();
            context.fillStyle = "red";
            if (this.head == null) context.fillStyle = "brown";
            var c = plane.getInnerCoord(this.coord);
            context.fillRect(c.x, c.y, plane.xunit, plane.yunit);
            //context.strokeStyle("black");
            context.strokeRect(c.x, c.y, plane.xunit, plane.yunit);
            context.stroke();
        }
        this.tail = tail;
        this.head = head;
    }


    //init
    for (var i = 1; i < size; i++) {
        this.grow();
    }
}