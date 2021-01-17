const DNA_HEIGHT = 20;
const DNA_WIDTH = 10;
const CELL_HEIGHT = 200;
const CELL_WIDTH = 200;
const SETTINGS_WIDTH = 300;
const TRIANGLE_HEIGHT = 15;

const DNA_ABSORB_NUTRIENTS = 0;
const DNA_REMOVE_WASTE = 1;
const DNA_INCREASE_DEFENSE = 2;
const DNA_WRITE_SEGMENT = 3;

const ACTIONS = [DNA_ABSORB_NUTRIENTS, DNA_REMOVE_WASTE, DNA_INCREASE_DEFENSE, DNA_WRITE_SEGMENT];
const COLORS = ["#FF0000","#00FF00","#0000FF",  "#FFFF00"]
const DEFAULT_COLOR = "FF00FF";

const WHITE = "#FFFFFF";
const BLACK = "#000000";

let cells = [];
let viruses = [];

const ARROW_MOVE_TIME = 1000; //ms'

const ENERGY_LOST_ON_ACTION = 5;
const VIRUS_MOVE_SPEED = 5;

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

        this.copy_start = 0;
        this.copy_end = 0;

        this.energy = 100;
        this.defense = 100;
        this.waste = 0;
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
            if (!ctx.fillStyle) {
                ctx.fillStyle = DEFAULT_COLOR;
            }
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

    do_action() {
        switch (this.dna[this.pointer]) {
            
            case DNA_ABSORB_NUTRIENTS:
                this.energy += 40;
                if (this.energy > 100) {
                    this.energy = 100;
                }
                break;
            case DNA_REMOVE_WASTE:
                this.waste = 0;
                break;
            case DNA_INCREASE_DEFENSE:
                this.defense += 10
                if (this.defense > 100) {
                    this.defense = 100;
                }
            
            
            case DNA_WRITE_SEGMENT:

            default:
                this.copy_start = this.dna[this.pointer][0];
                this.copy_end = this.dna[this.pointer][0];
        }   
        this.energy -= ENERGY_LOST_ON_ACTION;
    }

    absorb_virus(virus) {
        this.dna = this.dna.concat(virus.dna);

    }
}

class Virus { 
    constructor(dna, canvas, x = 0, y = 0, dx = Math.random() / 2 * VIRUS_MOVE_SPEED, dy = Math.random() / 2 * VIRUS_MOVE_SPEED) {
        this.dna = dna;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;

        this.last_x = this.canvas.width;
        this.last_y = this.canvas.height;
        
    }

    draw() {
        let ctx = this.canvas.getContext("2d");
        for (let i = 0; i < this.dna.length; i++) {            
            ctx.fillStyle = COLORS[this.dna[i]]
            if (!ctx.fillStyle) {
                ctx.fillStyle = DEFAULT_COLOR;
            }
            ctx.fillRect(this.x + i * DNA_WIDTH, this.y, DNA_WIDTH, DNA_HEIGHT);
        }
        this.last_x = this.x;
        this.last_y = this.y;
    }

    check_for_cell_collisions() {
        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = WHITE;
        
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i]
            if (cell.x < this.x && this.x < cell.x + CELL_WIDTH && cell.y < this.y && this.y < cell.y + CELL_HEIGHT) {
                ctx.fillRect(this.x, this.y, DNA_WIDTH * this.dna.length, DNA_HEIGHT);
                cell.absorb_virus(this);
                return true;
                 
            }
  
        return false;
        }
    }
}

function update_all() {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    cells.forEach(cell => {
        let d = new Date();
        if (cell.time + ARROW_MOVE_TIME < d.getTime()) {
            cell.time = d.getTime();
            cell.pointer += 1
            cell.pointer = cell.pointer % cell.dna.length;
            cell.do_action();
        }
        cell.draw();
    });
    viruses.forEach((virus, i) => {
        if (virus.check_for_cell_collisions()) {
            viruses.splice(i, 1);
        }
        virus.x += virus.dx;
        virus.y += virus.dy;
        if (virus.x < 0 || virus.x > virus.canvas.width) {
            virus.dx = -virus.dx;
        }
        if (virus.y < 0 || virus.y > virus.canvas.height) {
            virus.dy = -virus.dy;
        }
        virus.draw();
    })

    requestAnimationFrame(update_all);
}
requestAnimationFrame(update_all);


