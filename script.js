const points = 1000;
const clusters = 10;
const N = 2;


// N-dimentional point
class Point {
    v = [];
    c = "#000000";
    r = 2;
    banned = false;

    constructor(v, c, r) {
        this.v = v;
        this.c = c ?? this.c;
        this.r = r ?? this.r;
    }

    // N-d point to N-d point distance
    getDistance = (point) => Math.pow(this.v.reduce((p, c, i) => p + Math.pow((c - point.v[i]), 2), 0), 0.5);
}

// point to center of cluster relation
class Relation {
    constructor(p, c) {
        this.p = p;
        this.c = c;
    }
}

// N-dimentional space which stores points, centrers and clusters 
class Field {
    constructor(m, np, nc) {
        this.threshold = 1;

        this.n = m.length;
        this.np = np;
        this.nc = nc;

        this.points = [...Array(np)].map(() => 
            new Point([...Array(m.length)].map((x, i) => getRandom(m[i]))));

        this.centers = [...Array(nc)].map(() => 
            new Point([...Array(m.length)].map((x, i) => getRandom(m[i])), "#FF0000"));

        this.calculateClusters();
    }

    // deside which point belongs to wich center aka cluster
    calculateClusters = () => {
        this.relations = new Array(this.np);

        this.points.forEach((p, i) => {
            //TODO: search of closest center should be replaced with better algorythm
            const c = this.centers.sort((c1, c2) => minDistanceSorter(p, c1, c2))[0]; 
            this.relations.push(new Relation(p, c));
        });
    }
    
    // calculates clusters center of mass and move centers to new locations
    moveCenters = () => {
        this.centers
            .filter((c) => !c.banned)
            .forEach((c, i) => {
                const oldCenter = new Point([...c.v], c.c, c.r);
                const cluster = this.relations.filter((r) => r.c == c);
                const newCenter = new Point([...Array(this.n)].map(
                        (x, i) => cluster.reduce((s, r, j) => s + r.p.v[i], 0) / cluster.length
                    ));

                newCenter.v.forEach((x, i) => c.v[i] = x);
                
                // exclude center from calcultaion if distance between old and new center of cluster is less then threshold
                if(Math.abs(oldCenter.getDistance(newCenter)) < this.threshold) {
                    c.banned = true;
                }
            }); 

        this.calculateClusters();
    }
}

// Draw on 2D canvas
class Drawer {
    constructor() {
        this.canvas = document.getElementById("canvas");
    }

    init2D = () => {
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.drawCanvas2D();
    }

    drawCanvas2D = () => {
        this.ctx.fillStyle = "#999999";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawPoint2D = (p) => {
        this.ctx.beginPath();
        this.ctx.arc(p.v[0], p.v[1], p.r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = p.c;
        this.ctx.stroke();
    }

    drawLine2D = (a, b) => {
        this.ctx.moveTo(a.v[0], a.v[1]);
        this.ctx.lineTo(b.v[0], b.v[1]);
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.stroke();
    }

    getWidth = () => this.width;

    getHeight = () => this.height;

    draw = (field) => {
        this.drawCanvas2D();

        field.points.forEach(this.drawPoint2D);
        field.centers.forEach(this.drawPoint2D);
        field.relations.forEach((r) => this.drawLine2D(r.p, r.c));
    }
}

// 
const minDistanceSorter = (a, b1, b2) => {
    const d1 = a.getDistance(b1);
    const d2 = a.getDistance(b2);
    return d1 - d2;
}

// random 0 to N
const getRandom = (n) => Math.random() * n;

// generate new field
const getField = (m, p, c) => new Field(m, p, c);

const main = () => {
    const drawer = new Drawer();
    drawer.init2D();

    const w = drawer.getWidth();
    const h = drawer.getHeight();

    const field = getField([w, h], points, clusters);

    const id = setInterval(() => {
        field.moveCenters();

        drawer.draw(field);
    }, 1000);
};

main();