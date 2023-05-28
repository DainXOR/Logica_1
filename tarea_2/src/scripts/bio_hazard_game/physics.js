class Vector3{
    x = 0;
    y = 0;
    z = 0;

    constructor(x = 0, y = 0, z = 0){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class BC{
    constructor(center = new Vector3(), radius = 0){
        this.center = center;
        this.radius = radius;
    }

    contains(x, y){
        return  x >= this.center.x - this.radius && 
                x <= this.center.x + this.radius &&
                y >= this.center.y - this.radius &&
                y <= this.center.y + this.radius;
    }

    isCollidingBC(other){
        const de_sqr = this.distanceTo(other);
        const dr_sqr = (this.radius + other.radius) * (this.radius + other.radius);

        return de_sqr < dr_sqr;
    }
    isCollidingAABB(other){
        return  ((this.center.x + this.radius >= other.pos.x && 
            this.center.x + this.radius <= other.pos.x + other.width) 
            ||
            (this.center.x - this.radius >= other.pos.x && 
            this.center.x - this.radius <= other.pos.x + other.width))
            &&
            ((this.center.y + this.radius >= other.pos.y && 
            this.center.y + this.radius <= other.pos.y + other.height) 
            ||
            (this.center.y - this.radius >= other.pos.y && 
            this.center.y - this.radius <= other.pos.y + other.height));
    }

    distanceTo(other){
        const dx_sqr = (other.center.x - this.center.x) * (other.center.x - this.center.x);
        const dy_sqr = (other.center.y - this.center.y) * (other.center.y - this.center.y);

        return dx_sqr + dy_sqr;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffff007f";
        ctx.fill();
        ctx.closePath();
    }
}
class AABB{

    constructor(pos = new Vector3(), w, h){
        this.pos = pos;
        this.width = w;
        this.height = h;
    }

    contains(x, y){
        return  x >= this.pos.x && 
                x <= this.pos.x + this.width &&
                y >= this.pos.y &&
                y <= this.pos.y + this.height;
    }

    isCollidingBC(other){
        return  ((other.bc.center.x + other.bc.radius >= this.pos.x && 
                other.bc.center.x + other.bc.radius <= this.pos.x + this.width) 
                ||
                (other.bc.center.x - other.bc.radius >= this.pos.x && 
                other.bc.center.x - other.bc.radius <= this.pos.x + this.width))
                &&
                ((other.bc.center.y + other.bc.radius >= this.pos.y && 
                other.bc.center.y + other.bc.radius <= this.pos.y + this.height) 
                ||
                (other.bc.center.y - other.bc.radius >= this.pos.y && 
                other.bc.center.y - other.bc.radius <= this.pos.y + this.height));
    }
    isCollidingAABB(other){
        return  other.pos.x + other.aabb.width >= this.pos.x && 
                other.pos.x <= this.pos.x + this.width &&
                other.pos.y + other.aabb.height >= this.pos.y &&
                other.pos.y <= this.pos.y + this.height;
    }

    distanceTo(other){
        const dx_sqr = ((other.pos.x + other.width * 0.5) - (this.pos.x + this.width * 0.5)) * ((other.pos.x + other.width * 0.5) - (this.pos.x + this.width * 0.5));
        const dy_sqr = ((other.pos.y + other.height * 0.5) - (this.pos.y + this.height * 0.5)) * ((other.pos.y + other.height * 0.5) - (this.pos.y + this.height * 0.5));

        return dx_sqr + dy_sqr;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
        ctx.lineWidth = "3";
        ctx.strokeStyle = "#00ff007f";
        ctx.stroke();
        ctx.closePath();
    }
}

// My implementation of quadtree data struct
class QuadTree {
    constructor(pos, w, h, capacity = 8){
        this.pos = pos;
        this.width = w;
        this.height = h;

        this.capacity = capacity;

        this.elements = [];

        this.divided = false;

        this.color = "#000000";
    }

    contains(elementPos){
        const inLeftBoundary = elementPos.x >= this.pos.x;
        const inRightBoundary = elementPos.x <= (this.pos.x + this.width);

        const inTopBoundary = elementPos.y >= this.pos.y;
        const inBottomBoundary = elementPos.y <= (this.pos.y + this.height);    

        return inLeftBoundary && inRightBoundary && inTopBoundary && inBottomBoundary;
    }
    completelyContained(rect){

        return  rect.pos.x <= this.pos.x &&
                rect.pos.y <= this.pos.y &&
                rect.pos.x + rect.width >= this.pos.x + this.width &&
                rect.pos.y + rect.height >= this.pos.y + this.height;

    }
    intersects(rect){
        return !(rect.pos.x + rect.width <= this.pos.x ||
                 rect.pos.y + rect.height <= this.pos.y ||
                 rect.pos.x >= this.pos.x + this.width ||
                 rect.pos.y >= this.pos.y + this.height);
    }

    subdivide(){
        this.divided = true;

        this.qtTopLeft = new QuadTree(
            new Vector3(this.pos.x, this.pos.y),
            this.width * 0.5, 
            this.height * 0.5,
            this.capacity
        );

        this.qtTopRight = new QuadTree(
            new Vector3(this.pos.x + this.width * 0.5, this.pos.y),
            this.width * 0.5, 
            this.height * 0.5,
            this.capacity
        );

        this.qtBottomLeft = new QuadTree(
            new Vector3(this.pos.x, this.pos.y + this.height * 0.5),
            this.width * 0.5, 
            this.height * 0.5,
            this.capacity
        );

        this.qtBottomRight = new QuadTree(
            new Vector3(this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5),
            this.width * 0.5, 
            this.height * 0.5,
            this.capacity
        );
    }

    insert(graphicItem){
        if(!this.contains(graphicItem.pos)){
            return false;
        }

        if(this.elements.length < this.capacity){
            this.elements.push(graphicItem);
            return true;
        }
        else if(!this.divided) {
            this.subdivide();
            this.divided = true;
        }

        this.qtTopLeft.insert(graphicItem) ||
        this.qtTopRight.insert(graphicItem) ||
        this.qtBottomLeft.insert(graphicItem) ||
        this.qtBottomRight.insert(graphicItem);

        return true;

    }

    getAllElements(){
        let allElements = this.elements;

        if(this.divided){
            allElements = allElements.concat(
                this.qtTopLeft.getAllElements(),
                this.qtTopRight.getAllElements(),
                this.qtBottomLeft.getAllElements(),
                this.qtBottomRight.getAllElements()
            );
        }

        return allElements;
    }

    getElementsInside(area){
        let containedElements = [];

        if(this.completelyContained(area)){
            return this.getAllElements();
        }
        if(this.intersects(area)){
            for (let i = 0; i < this.elements.length; i++) {
                if(new BC(new Vector3(500, 500), 5).contains(this.elements[i].pos.x, this.elements[i].pos.y)){
                    console.log(this.elements[i]);
                }

                area.contains(this.elements[i].pos.x, this.elements[i].pos.y) &&
                containedElements.push(this.elements[i]);
            }
            if(this.divided){
                containedElements = containedElements.concat(
                    this.qtTopLeft.getElementsInside(area),
                    this.qtTopRight.getElementsInside(area),
                    this.qtBottomLeft.getElementsInside(area),
                    this.qtBottomRight.getElementsInside(area)
                );
            }
            
        }

        return containedElements;
    }
    getElementsColliding(area){
        let containedElements = [];

        if(this.completelyContained(area)){
            return this.getAllElements();
        }
        if(this.intersects(area)){
            for (let i = 0; i < this.elements.length; i++) {
                (area.contains(this.elements[i]) || area.isCollidingBC(this.elements[i])) && 
                containedElements.push(this.elements[i]);
                
            }
            if(this.divided){
                containedElements = containedElements.concat(
                    this.qtTopLeft.getElementsInside(area),
                    this.qtTopRight.getElementsInside(area),
                    this.qtBottomLeft.getElementsInside(area),
                    this.qtBottomRight.getElementsInside(area)
                );
            }
            
        }

        return containedElements;
    }
    getCloseElements(area, hasParent = false){
        let containedElements = [];

        if(this.completelyContained(area)){
            this.color = "#1f1fff";
            return this.getAllElements();
        }

        if(this.intersects(area)){
            this.color = "#ffff00";

            if(!hasParent){
                containedElements = containedElements.concat(this.getElementsInside(area));
            } 
            if (!this.divided){
                return this.getAllElements();
            }

            if(!hasParent && this.divided && !this.qtTopLeft?.divided){
                containedElements = containedElements.concat(this.elements);
            }
            if(this.divided){
                containedElements = containedElements.concat(
                    this.qtTopLeft.getCloseElements(area, true),
                    this.qtTopRight.getCloseElements(area, true),
                    this.qtBottomLeft.getCloseElements(area, true),
                    this.qtBottomRight.getCloseElements(area, true)
                );
            }
        }

        return containedElements;
    }
    getElementsAdyacent(area, parent = false){
        let containedElements = [];

        if(this.completelyContained(area)){
            this.color = "#1f1fff";
            return this.getAllElements();
        }

    }
    getElementsFullyContained(area){
        if(this.completelyContained(area)){
            return this.getAllElements();
        }
        if(this.divided){
            let containedElements = [];
            containedElements = containedElements.concat(
                this.qtTopLeft.getElementsFullyContained(area),
                this.qtTopRight.getElementsFullyContained(area),
                this.qtBottomLeft.getElementsFullyContained(area),
                this.qtBottomRight.getElementsFullyContained(area)
            );

            return containedElements;
        }
    }

    queryElements(area, type = "inside", predicate = (element) => true){
        //const seachType = {
        //    inside: this.getElementsInside,
        //    collide: this.getElementsColliding,
        //    adyacent: this.getElementsAdyacent,
        //    fully_contained: this.getElementsFullyContained,
        //}

        let result = [];

        switch (type) {
            case "inside": result = this.getElementsInside(area); break;
            case "collide": result = this.getElementsColliding(area); break;
            case "adyacent": result = this.getElementsAdyacent(area); break;
            case "fully_contained": result = this.getElementsFullyContained(area); break;
            default: result = []; break;
        }

        result = result.filter(predicate);

        return result;

    }

    draw(ctx){

        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
        ctx.lineWidth = "6";
        ctx.strokeStyle = this.color;
        ctx.stroke()
        ctx.closePath();

        this.color = "#000000";

        //ctx.beginPath();
        //ctx.arc(this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5, 5, 0, Math.PI * 2);
        //ctx.fillStyle = "#ff0000";
        //ctx.fill();
        //ctx.closePath();

        if(this.divided){
            this.qtTopLeft?.draw(ctx);
            this.qtTopRight?.draw(ctx);
            this.qtBottomLeft?.draw(ctx);
            this.qtBottomRight?.draw(ctx);
        }
    }
}