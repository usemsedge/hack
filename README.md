# hack
health-it hackaction emp

insert this into the f12 shell in browser

cell1 = new Cell([2, 1, 4, 0, 2, 3, 3, 0], document.getElementById("myCanvas"), x=400, y=200)  
virus1 = new Virus([1, 2, 3, 0], document.getElementById("myCanvas"), 0, 0)  
cells.push(cell1)  
viruses.push(virus1)  

The big black squares with colored dots in them are cells, and the little colored dots are DNA bits. The DNA bits are color-coded based on what they do - one color means its instruction is to clear waste, another is to increase the defense, etc. Each second, the little black arrow points to a different DNA bit and does the instruction. If the cell's energy goes to 0 or the waste goes to 100, the cell will die.
Viruses are DNA bits strung together. They cannot do anything by themselves, but if they touch a cell there is a chance that they will be added onto the cell's DNA. This can alter what the cell does.
