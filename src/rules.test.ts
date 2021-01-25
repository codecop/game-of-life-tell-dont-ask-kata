import { expect } from 'chai';

enum Cell {
    Alive, Dead,
}

function applyRules(cs: Cell, neighbourCount: number, cb: (nextcell: Cell) => void): void {
    const willLive = neighbourCount === 3 || (neighbourCount === 2 && cs === Cell.Alive);
    cb(willLive ? Cell.Alive : Cell.Dead);
}

describe('rules (1. start rules)', () => {

    it('a cell without neighbours dies', (cb) => {

        applyRules(Cell.Alive, 0, (nextcell) => {
            expect(nextcell).to.equal(Cell.Dead);
            cb();
        });
    });

    it('an alive cell with two neighbours stays alive', (cb) => {

        applyRules(Cell.Alive, 2, (nextcell) => {
            expect(nextcell).to.equal(Cell.Alive);
            cb();
        });
    });

    // TODO more tests, not related to TDA
});

// Column manages state of cell.
class Column {
    constructor(private state: Cell) {
    }

    public update(newState: Cell): void {
        this.state = newState;
    }

    public print(cb: (output: string) => void) {
        if (this.state === Cell.Alive) {
            cb('X');
        } else {
            cb(' ');
        }
    }

    // Teil von filter alive
    public execIfAlive(cb: () => void): void {
        if (this.state === Cell.Alive) {
            cb();
        }
    }

    public applyRules(count: number) {
        applyRules(this.state, count, (newState) => this.state = newState);
    }
}

describe('cell (2. callback for rules)', () => {

    it('a cell updates itself', (cb) => {
        const cell = new Column(Cell.Dead);
        cell.update(Cell.Alive);
        cell.execIfAlive(cb);
    });

    it('executes a callback if the cell is alive', (cb) => {
        const cell = new Column(Cell.Alive);
        cell.execIfAlive(cb);
    });

    it('executes a callback if the cell is dead', () => {
        const cell = new Column(Cell.Dead);
        cell.execIfAlive(() => {
            throw new Error();
        });
    });

    it('applies rules to a cell (bug?)', cb => {
        const cell = new Column(Cell.Alive);
        cell.applyRules(2);
        cell.execIfAlive(cb);
    })

    // finished
});

// Row manages list of Columns and delegates to columns. = First Class Collection
class Row {
    private columns: Column[] = [];

    constructor(length: number) {
        for (let i = 0; i < length; i++) {
            this.columns.push(new Column(Cell.Dead));
        }
    }

    public update(x: number, cell: Cell): void {
        this.columns[x].update(cell);
    }

    public eachLiveCellInBounds(x: number, cb: () => void): void {
        this.columns[x].execIfAlive(cb);
        this.eachLiveCellAround(x, cb);
    }

    public eachLiveCellAround(x: number, cb: () => void): void {
        this.columns[x - 1]?.execIfAlive(cb);
        this.columns[x + 1]?.execIfAlive(cb);
    }

    public print(cb: (output: string) => void) {
        this.columns.forEach(cell => {
            cell.print(cb);
        });
    }

    public applyRules(x: number, count: number) {
        this.columns[x].applyRules(count);
    }

    copyInto(row: Row) {
        this.columns.forEach((cell, x) => {
            row.setColumn(x, cell);
        })
    }

    private setColumn(x: number, cell: Column) {
        cell.execIfAlive(() => {
            this.columns[x].update(Cell.Alive)
        })
    }
}

// Grid manages list of Rows and delegates to rows. = First Class Collection
class Grid {

    private rows: Row[] = [];

    constructor(sizeX: number, sizeY: number) {
        for (let i = 0; i < sizeY; i++) {
            this.rows.push(new Row(sizeX));
        }
    }

    public countLivingNeighboursAt(x: number, y: number, cb: (neighboursCount: number) => void): void {
        let neighboursCount = 0;

        this.rows[y - 1]?.eachLiveCellInBounds(x, () => neighboursCount++);
        this.rows[y].eachLiveCellAround(x, () => neighboursCount++);
        this.rows[y + 1]?.eachLiveCellInBounds(x, () => neighboursCount++);

        cb(neighboursCount);
    }

    public update(x: number, y: number, cell: Cell): void {
        this.rows[y].update(x, cell);
    }

    public print(cb: (output: string) => void) {
        this.rows.forEach(row => {
            row.print(cb);
            cb('\n');
        });
    }

    // v1
    public applyRules(x: number, y: number, count: number): void {
        this.rows[y].applyRules(x, count);
    }

    public copyInto(newGrid: Grid) {
        this.rows.forEach((row, y) => {
            newGrid.setRow(y, row);
        })
    }

    private setRow(y: number, row: Row) {
        row.copyInto(this.rows[y]);
    }

    // v2 ... same as v1 :-(
    // applyRulesInto(x: number, y: number, count: number, newGrid: Grid) {
    //    newGrid.applyRulesFrom(x, y, count, this.rows[y]);
    // }
}

describe('grid (3. countNeighbours will be used in rules)', () => {

    it('counts neighbours in empty grid', (cb) => {
        const grid = new Grid(3, 3);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count single alive neighbors not in corner', (cb) => {
        // Continued where do neighbours come from
        const grid = new Grid(3, 3);
        grid.update(0, 0, Cell.Alive);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(1);
            cb();
        });
    });

    it('do not count dead neighbors not in corner', (cb) => {
        const grid = new Grid(3, 3);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count two alive neighbors not in corner', (cb) => {
        const grid = new Grid(3, 3);
        grid.update(0, 0, Cell.Alive);
        grid.update(0, 1, Cell.Alive);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(2);
            cb();
        });
    });

    it('count zero alive neighbours with other alive cells not near', (cb) => {
        const grid = new Grid(4, 4);
        grid.update(0, 0, Cell.Alive);

        grid.countLivingNeighboursAt(2, 2, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count not itself', (cb) => {
        const grid = new Grid(3, 3);
        grid.update(1, 1, Cell.Alive);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });


    it('counts upper and lower neighbour (bug?)', (cb) => {
        const grid = new Grid(3, 3);
        grid.update(1, 0, Cell.Alive);
        grid.update(1, 1, Cell.Alive);
        grid.update(1, 2, Cell.Alive);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(2);
            cb();
        });
    });

    // handle overflow - done without tests
});

class Game {
    private grid: Grid;

    constructor(private sizeX: number, private sizeY: number) {
        this.grid = new Grid(sizeX, sizeY);
    }

    public seed(x: number, y: number): void {
        this.grid.update(x, y, Cell.Alive);
    }

    public tick() {
        // v1
        const newGrid = new Grid(this.sizeX, this.sizeY);
        this.grid.copyInto(newGrid);

        for (let y = 0; y < this.sizeY; y++) {
            for (let x = 0; x < this.sizeX; x++) {
                this.grid.countLivingNeighboursAt(x, y, (count) => {
                    newGrid.applyRules(x, y, count);
                    // v2 this.grid.applyRulesInto(x, y, count, newGrid);
                });
            }
        }

        this.grid = newGrid;
    }

    public print(cb: (output: string) => void): void {
        // could put that into test, does not matter.
        let accumulator = '';

        this.grid.print((output) => accumulator += output);

        cb(accumulator);
    }
}

describe('Game (callback for countNeighboursAt)', () => {
    it('prints the board', cb => {
        const game = new Game(3, 3);
        game.seed(1, 0);
        game.seed(1, 1);
        game.seed(1, 2);

        game.print(output => {
            expect(output).equals(
                ' X \n' +
                ' X \n' +
                ' X \n'
            );
            cb();
        });
    });
    it('prints board other dimension', cb => {
        const game = new Game(3, 3);
        game.seed(0, 1);
        game.seed(1, 1);
        game.seed(2, 1);

        game.print(output => {
            expect(output).equals(
                '   \n' +
                'XXX\n' +
                '   \n'
            );
            cb();
        });
    });

    it('iterates the board (version 1 with double dispatch)', cb => {
        const game = new Game(3, 3);
        game.seed(1, 0);
        game.seed(1, 1);
        game.seed(1, 2);

        game.tick();

        game.print(output => {
            expect(output).equals(
                '   \n' +
                'XXX\n' +
                '   \n'
            );
            cb();
        });
    });
});



// TODO bug in final test?

// TODO Counter Objeckt statt Callback bei Nachbar zählen
// Idee: Statt Callback bei isAlive einfach den Counter übergeben
// -> weniger Callback, weniger generisch, mehr Kommplung

// TODO alle Callbacks prüfen ob wir sie brauchen

// TODO seed method for tests for readability (but not related to TDA)
