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

class AABB{
    center = new Vector3();
    radius = 0;

    constructor(center = new Vector3(), radius = 0){
        this.center = center;
        this.radius = radius;
    }

    isColliding(other){
        const dx_sqr = (other.center.x - this.center.x) * (other.center.x - this.center.x);
        const dy_sqr = (other.center.y - this.center.y) * (other.center.y - this.center.y);
        const dr_sqr = (this.radius + other.radius) * (this.radius + other.radius);

        return (dx_sqr + dy_sqr) < dr_sqr;
    }
}
 
// The objects that we want stored in the quadtree
class Node {
    pos = new Vector3();
    data = 0;

    constructor(_pos = new Vector3(), _data = 0){
        this.pos = _pos;
        this.data = _data;
    }
};
 
// The main quadtree class
class Quad {
    topLeft = new Vector3();
    botRight = new Vector3();

    constructor(topL = new Vector3(), botR = new Vector3()){ // (Vector, Vector)
        // Hold details of the boundary of this node
        this.topLeft = topL;
        this.botRight = botR;

        // Contains details of node
        this.n = null;

        // Children of this tree
        this.topLeftTree = null;
        this.topRightTree = null;
        this.botLeftTree = null;
        this.botRightTree = null;
    }
    insert(_node){
        if (_node == null){
            return;
        }
 
        // Current quad cannot contain it
        if (!inBoundary(_node.pos)){
            return;
        }
 
        // We are at a quad of unit area
        // We cannot subdivide this quad further
        if (abs(this.topLeft.x - this.botRight.x) <= 1 && 
            abs(this.topLeft.y - this.botRight.y) <= 1) {
            if (this.n === null){
                this.n = _node;
            }
            return;
        }
 
        if ((this.topLeft.x + this.botRight.x) / 2 >= _node.pos.x) {
            // Indicates topLeftTree
            if ((this.topLeft.y + this.botRight.y) / 2 >= _node.pos.y) {
                if (this.topLeftTree == null){
                    this.topLeftTree = new Quad(
                        new Vector3(this.topLeft.x, this.topLeft.y),
                        new Vector3((this.topLeft.x + this.botRight.x) / 2,
                                (this.topLeft.y + this.botRight.y) / 2)
                    );
                }
                this.topLeftTree.insert(_node);
            }
        
            // Indicates botLeftTree
            else {
                if (this.botLeftTree == null){
                    this.botLeftTree = new Quad(
                        new Vector3(this.topLeft.x,
                            (this.topLeft.y + this.botRight.y) / 2),
                        new Vector3((this.topLeft.x + this.botRight.x) / 2,
                            this.botRight.y)
                    );
                }
                this.botLeftTree.insert(_node);
            }
        }
        else {
            // Indicates topRightTree
            if ((this.topLeft.y + this.botRight.y) / 2 >= _node.pos.y) {
                if (this.topRightTree == null){
                    this.topRightTree = new Quad(
                        new Vector3((this.topLeft.x + this.botRight.x) / 2,
                                    this.topLeft.y),
                        new Vector3(this.botRight.x,
                                    (this.topLeft.y + this.botRight.y) / 2)
                    );
                }
                this.topRightTree.insert(_node);
            }
        
            // Indicates botRightTree
            else {
                if (this.botRightTree == null){
                    this.botRightTree = new Quad(
                        new Vector3((this.topLeft.x + this.botRight.x) / 2,
                                    (this.topLeft.y + this.botRight.y) / 2),
                        new Vector3(this.botRight.x, this.botRight.y)
                    );
                }
                this.botRightTree.insert(_node);
            }
        }
    }
    search(_vector){ // returns Node*
            // Current quad cannot contain it
        if (!inBoundary(_vector)){
            return null;
        }

        // We are at a quad of unit length
        // We cannot subdivide this quad further
        if (n != null)
            return n;

        if ((this.topLeft.x + this.botRight.x) / 2 >= _vector.x) {
            // Indicates topLeftTree
            if ((this.topLeft.y + this.botRight.y) / 2 >= _vector.y) {
                if (this.topLeftTree == null)
                    return null;
                return this.topLeftTree.search(_vector);
            }
        
            // Indicates botLeftTree
            else {
                if (this.botLeftTree == null)
                    return null;
                return this.botLeftTree.search(_vector);
            }
        }
        else {
            // Indicates topRightTree
            if ((this.topLeft.y + this.botRight.y) / 2 >= _vector.y) {
                if (this.topRightTree == null)
                    return null;
                return this.topRightTree.search(_vector);
            }
        
            // Indicates botRightTree
            else {
                if (this.botRightTree == null)
                    return null;
                return this.botRightTree.search(_vector);
            }
        }
    }
    inBoundary(_vector){ // returns Bool
        return (_vector.x >= this.topLeft.x && 
                _vector.x <= this.botRight.x && 
                _vector.y >= this.topLeft.y && 
                _vector.y <= this.botRight.y);
    }
};