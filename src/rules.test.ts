import {expect} from 'chai';

enum Cell {
    Alive, Dead,
}

function applyRules(cs: Cell, neighbourCount: number, cb: (nextcell: Cell) => void): void {
    cb(Cell.Dead);
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

    // public print(printer: (nextcell: cell) => void) {
    //     // only used for test
    //     // we don't want to expose internal state - not even through callbacks.
    //     printer(this.state);
    // }

    public execIfAlive(cb: () => void): void {
        if (this.state === Cell.Alive) {
            cb();
        }
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
        for(let i=0; i< length; i++) {
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
        this.columns[x-1].execIfAlive(cb);
        this.columns[x+1].execIfAlive(cb);
    }
}

class Grid {

    private rows: Row[] = [];

    constructor(sizeX: number, sizeY: number) {
        for(let i=0; i< sizeY; i++) {
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

    public put(x: number, y: number, cell: Cell): void {
        this.rows[y].update(x, cell);
    }

    private eachAliveCellAround(x: number, y: number, cb: () => void): void {
        this.rows[y-1].eachLiveCellInBounds(x, cb);
        this.rows[y].eachLiveCellAround(x, cb);
        this.rows[y+1].eachLiveCellInBounds(x, cb);
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
        grid.put(0, 0, Cell.Alive);

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
        grid.put(0, 0, Cell.Alive);
        grid.put(0, 1, Cell.Alive);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(2);
            cb();
        });
    });

    it('count zero alive neighbours with other alive cells not near', (cb) => {
        const grid = new Grid(4, 4);
        grid.put(0, 0, Cell.Alive);

        grid.countLivingNeighboursAt(2, 2, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count not itself', (cb) => {
        const grid = new Grid(3, 3);
        grid.put(1, 1, Cell.Alive);

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    // TODO handle overflow
});

// class Game {
//     private grid = new Grid();
//
//     public seed(x: number, y: number): void {
//         this.grid.put(x, y, cell.Alive);
//     }
//
//     // public print(leftX: number, upperY: number, rightX: number, lowerY: number, cb: (output: string) => void): void {
//     //     let output = '';
//     //     for (let y = lowerY; y < upperY; y++) {
//     //         for (let x = leftX; x < rightX; x++) {
//     //             this.grid.print(x, y, (character) => output += character);
//     //         }
//     //         output += '\n';
//     //     }
//     //     cb(output);
//     // }
// }

// describe('(callback for countNeighboursAt)', () => {
    // it('prints the board', cb => {
        // const game = new Game();
        // game.seed(1, 0);
        // game.seed(1, 1);
        // game.seed(1, 2);
        //
        // game.print(0, 0, 3, 3, output => {
        //     expect(output).equals(
        //         ' X \n' +
        //         ' X \n' +
        //         ' X \n'
        //     );
        //     cb();
        // });
    // });
// });
