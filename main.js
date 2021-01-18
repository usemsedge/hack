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
const NUMBER_TO_STRING = ["Absorb Nutrients", "Remove Waste", "Increase Defense", "Write Segment"];
const COLORS = ["#FF0000","#00FF00","#0000FF", "#FFFF00"]
const CHANGE_SEGMENT_COLOR = "#FF00FF";
const MAKE_PROTIEN_COLOR = '#00FFFF';

const WHITE = "#FFFFFF";
const BLACK = "#000000";

let cells = [];
let viruses = [];

const ARROW_MOVE_TIME = 1000; //ms'

const ENERGY_LOST_ON_ACTION = 5;
const VIRUS_MOVE_SPEED = 5;
const VIRUS_HIT_SUBTRACT = 10;
const DEFENSE_LOST_ON_WASTE = 1;

function hash(string) {
    let i = 0;
    for (let j = 0; j < string.length; j++) {
        i += string.charCodeAt(j);
    }
    return (i * (10**9 + 7) + 10**9 + 7) % 5;
}

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
        this.viruses = [];
        
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
            ctx.fillStyle = COLORS[this.dna[i]];
            if (typeof this.dna[i] === "object") {
                if (this.dna[i].length === 2) {
                    ctx.fillStyle = CHANGE_SEGMENT_COLOR;
                }
                else {
                    ctx.fillStyle = MAKE_PROTIEN_COLOR;
                }
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
                if (this.defense > 0) {
                    this.waste = 0;
                    this.defense -= DEFENSE_LOST_ON_WASTE;
                }
                break;
            case DNA_INCREASE_DEFENSE:
                this.defense += 10
                if (this.defense > 100) {
                    this.defense = 100;
                }
                break;
            
            
            case DNA_WRITE_SEGMENT:
                let virus = new Virus(this.dna.slice(this.copy_start, this.copy_end), this.canvas, this.x + CELL_WIDTH / 2, this.y + CELL_HEIGHT / 2);
                virus.created_by_cell = true;
                virus.host_cell = this;
                
                
                viruses.push(virus);
                this.viruses.push(virus);
                break;

            default:
                if (this.dna[this.pointer].length === 1) {
                    this.immunity.push(this.dna[this.pointer][0]);
                }
                else {
                    this.copy_start = this.dna[this.pointer][0]; //these will be relative
                    this.copy_end = this.dna[this.pointer][1];
                }
        }   
        this.energy -= ENERGY_LOST_ON_ACTION;
    }

    check_if_dead() {
        if (this.energy <= 0) {
            return true;
        }
        if (this.waste >= 100) {
            return true;
        }
        if (this.defense <= 0) {
            return true;
        }
        return false;
    }

    absorb_virus(virus) {
        if (virus.counter_protien in this.immunity) {
            if (this.defense * Math.random < 10) {
                this.dna = this.dna.concat(virus.dna);
            }
        }
        else if (this.defense * Math.random() < 50){
            this.dna = this.dna.concat(virus.dna);
        }
        else {
            this.defense -= VIRUS_HIT_SUBTRACT;
        }

    }

    suicide() {
        for (let i = 0; i < this.viruses.length; i++) {
            this.viruses[i].host_cell = null;
            this.viruses[i].created_by_cell = false;
        }
    }
}

class Virus { 
    constructor(dna, canvas, x = 0, y = 0, dx = Math.random() / 2 * VIRUS_MOVE_SPEED, dy = Math.random() / 2 * VIRUS_MOVE_SPEED, created_by_cell = false, host_cell = null) {
        this.dna = dna;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.created_by_cell = created_by_cell;
        this.host_cell = host_cell;
        this.counter_protien = hash(dna.toString());

        this.last_x = this.canvas.width;
        this.last_y = this.canvas.height;
        
    }

    draw() {
        let ctx = this.canvas.getContext("2d");
        for (let i = 0; i < this.dna.length; i++) {            
            ctx.fillStyle = COLORS[this.dna[i]]
            if (typeof this.dna[i] === "object") {
                if (this.dna[i].length === 2) {
                    ctx.fillStyle = CHANGE_SEGMENT_COLOR;
                }
                else {
                    ctx.fillStyle = MAKE_PROTIEN_COLOR;
                }
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
  
        
        }
        return false;
    }
}

function show_stats(cell) {
    if (!cell) {return;}
    let table_inner = '<thead><tr><th colspan=2>DNA pieces</th></tr></thead>';
    for (let i = 0; i < cell.dna.length; i++) {
        let this_color;
        if (typeof cell.dna[i] === "number") {
            this_color = COLORS[cell.dna[i]];
        }
        else if (cell.dna[i].length === 1) {
            this_color = MAKE_PROTIEN_COLOR;
        }
        else {
            this_color = CHANGE_SEGMENT_COLOR;
        }
        table_inner += `
<tr><td style="background-color:${this_color}" width=30></td><td>${NUMBER_TO_STRING[cell.dna[i]] || "Set Copying Location"}</td></tr>`
    }
    document.getElementById("dna").innerHTML = table_inner;
    document.getElementById("energy").innerHTML = `ENERGY: ${cell.energy}`;
    document.getElementById("defense").innerHTML = `DEFENSE: ${cell.defense}`;
    document.getElementById("waste").innerHTML = `WASTE: ${cell.waste}`;
}


function on_click(event) {
    let top = canvas.offsetTop + canvas.clientTop;
    let left = canvas.offsetLeft + canvas.offsetTop;
    let x = event.pageX - left;
    let y = event.pageY - top;
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        if (cell.x < x && x < cell.x + CELL_WIDTH && cell.y < y && y < cell.y + CELL_HEIGHT) {
            last_cell_stats = cell;
            return;
        }
    }
}

canvas = document.getElementById("myCanvas");
canvas.addEventListener("click", on_click);

let last_cell_stats = undefined;

function update_all() {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < cells.length; i++) {
        cell = cells[i]
        if (cell.check_if_dead()) {
            cell.suicide();
            cells.splice(i, 1);
            last_cell_stats = undefined;
            continue;
        }
        let d = new Date();
        if (cell.time + ARROW_MOVE_TIME < d.getTime()) {
            cell.time = d.getTime();
            cell.pointer += 1
            cell.pointer = cell.pointer % cell.dna.length;
            cell.do_action();
            cell.defense -= DEFENSE_LOST_ON_WASTE * cell.viruses.length;
        }
        cell.draw();
        
    }
    show_stats(last_cell_stats);
    for (let i = 0; i < viruses.length; i++) {
        let virus = viruses[i];
        if (!virus.created_by_cell && virus.check_for_cell_collisions()) {
            viruses.splice(i, 1);
        }
        virus.x += virus.dx;
        virus.y += virus.dy;
        if (!virus.created_by_cell) {
            if (virus.x < 0 || virus.x > virus.canvas.width) {
                virus.dx = -virus.dx;
            }
            if (virus.y < 0 || virus.y > virus.canvas.height) {
                virus.dy = -virus.dy;
            }
        }
        else {
            if (virus.x < virus.host_cell.x || virus.x > virus.host_cell.x + CELL_WIDTH) {
                virus.dx = -virus.dx;
            }
            if (virus.y < virus.host_cell.y || virus.y > virus.host_cell.y + CELL_HEIGHT) {
                virus.dy = -virus.dy;
            }
        }
        virus.draw();
    }
    

    requestAnimationFrame(update_all);
}
requestAnimationFrame(update_all);


