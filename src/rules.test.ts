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

    // TODO more tests, not related to TDA
});

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

    // finished
});

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
}

class Grid {

    private rows: Row[] = [];

    constructor(sizeX: number, sizeY: number) {
        for (let i = 0; i < sizeY; i++) {
            this.rows.push(new Row(sizeX));
        }
    }

    public countLivingNeighboursAt(x: number, y: number, cb: (neighboursCount: number) => void): void {
        let neighboursCount = 0;
        this.eachAliveCellAround(x, y, () => neighboursCount++);

        // Wilde Idee: Kann ich eine filter-map Kette dual in den callback functions haben?
        // // API like this?
        // this.eachCell(cell.print |> execIf |> c == State.Alive |> inc)
        // // ist das currying? API like this?
        // this.eachCell(cell.print)(execIf)(isAlive)(inc)
        //
        // const _eachCell = (f: (cell: Cell) => void) => {
        //     return (self: Grid) => self.eachCell((cell) => f(cell));
        // };
        // const _getcell = (f: (cell: cell) => void) => {
        //     return (cell: Cell) => cell.print((cell) => f(cell));
        // };
        // const _ifCellAlive = (f: () => void) => {
        //     return (cell: cell) => {
        //         if (cell === cell.Alive) {
        //             f();
        //         }
        //     };
        // };
        // const _inc = () => {
        //     neighboursCount++;
        // };
        // // TODO Can we use currying on TDA?
        // _eachCell(_getcell(_ifCellAlive(_inc)))(this);
        // // Explicit callbacks had any type, now TS is deriving the exact type for us.

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

    public applyRules(x: number, y: number, count: number): void {
        this.rows[y].applyRules(x, count);
    }

    private eachAliveCellAround(x: number, y: number, cb: () => void): void {
        this.rows[y - 1]?.eachLiveCellInBounds(x, cb);
        this.rows[y].eachLiveCellAround(x, cb);
        this.rows[y + 1]?.eachLiveCellInBounds(x, cb);
    }
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
        const newGrid = new Grid(this.sizeX, this.sizeY);

        for (let y = 0; y < this.sizeY; y++) {
            for (let x = 0; x < this.sizeX; x++) {

                this.grid.countLivingNeighboursAt(x, y, (count) => {
                    newGrid.applyRules(x, y, count);
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

    it('iterates the board', cb => {
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
