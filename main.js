
const DNA_HEIGHT = 20;
const DNA_WIDTH = 20;
const CELL_HEIGHT = 200;
const CELL_WIDTH = 200;
const SETTINGS_WIDTH = 300;
const TRIANGLE_HEIGHT = 15;

const DNA_ABSORB_NUTRIENTS = 0;
const DNA_REMOVE_WASTE = 1;
const DNA_INCREASE_DEFENSE = 2;
const DNA_COPY_SEGMENT = 3;
const DNA_WRITE_SEGMENT = 4;

const COLORS = ["#FF0000","#00FF00","#0000FF",  "#FFFF00", "#800080"]

const WHITE = "#FFFFFF";
const BLACK = "#000000";

let cells = [];

const TIME_FOR_ARROW = 1000; //ms

class Cell {
    constructor(dna, canvas, x = 0, y = 0, 
                width = CELL_WIDTH, height = CELL_HEIGHT,
                bg = WHITE, outline=BLACK) {
        this.dna = dna;
        this.canvas = canvas;
        this.height = height;
        this.width = width;
        this.x = x;
        this.y = y;
        this.bg = bg;
        this.outline = outline;

        this.energy = 100;
        this.defense = 100;
        this.immunity = [];
        
        let d = new Date();
        this.time = d.getTime(); 
        this.pointer = 0;
    }

    draw() {
        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = this.bg;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.outline;
        ctx.fillRect(this.x, this.y, 1, this.height);
        ctx.fillRect(this.x, this.y, this.width, 1);
        ctx.fillRect(this.x, this.y + this.height, this.width, 1);
        ctx.fillRect(this.x + this.width, this.y, 1, this.height);
        for (let i = 0; i < this.dna.length; i++) {
            let start_x = this.x + i * DNA_WIDTH;
            let start_y = this.y + this.height / 2 - DNA_HEIGHT / 2;
            ctx.fillStyle = COLORS[this.dna[i]]
            ctx.fillRect(start_x, start_y, DNA_WIDTH, DNA_HEIGHT);
        }

        this.draw_black_triangle([this.x + this.pointer * DNA_WIDTH, this.y + this.height / 2 - DNA_HEIGHT / 2 - TRIANGLE_HEIGHT - 5],
                                 [this.x + (this.pointer + 1) * DNA_WIDTH, this.y + this.height / 2 - DNA_HEIGHT / 2 - TRIANGLE_HEIGHT - 5],
                                 [this.x + (this.pointer + 0.5) * DNA_WIDTH, this.y + this.height / 2 - DNA_HEIGHT / 2 - 5])
    }


    draw_black_triangle(point1, point2, point3) {
        let ctx = this.canvas.getContext("2d");
        ctx.beginPath()
        ctx.moveTo(point1[0], point1[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.lineTo(point3[0], point3[1]);
        ctx.closePath();
        ctx.fillStyle = BLACK;
        ctx.fill();
    }
}

function update_all_cells() {
    cells.forEach(cell => {
        let d = new Date();
        if (cell.time + TIME_FOR_ARROW < d.getTime()) {
            cell.time = d.getTime();
            cell.pointer += 1
            cell.pointer = cell.pointer % cell.dna.length;
        }
        cell.draw();
    });

    requestAnimationFrame(update_all_cells);
}
requestAnimationFrame(update_all_cells);


