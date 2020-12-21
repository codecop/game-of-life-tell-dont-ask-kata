import {expect} from 'chai';

enum CellState {
    Alive, Dead,
}

function applyRules(cs: CellState, neighbourCount: number, cb: (nextCellState: CellState) => void): void {
    cb(CellState.Dead);
}

describe('rules (1. start rules)', () => {

    it('a cell without neighbours dies', (cb) => {

        applyRules(CellState.Alive, 0, (nextCellState) => {
            expect(nextCellState).to.equal(CellState.Dead);
            cb();
        });
    });

    // TODO more tests, not related to TDA
});

class Cell {
    constructor(private state: CellState) {
    }

    public update(newState: CellState): void {
        this.state = newState;
    }

    // public print(printer: (nextCellState: CellState) => void) {
    //     // only used for test
    //     // we don't want to expose internal state - not even through callbacks.
    //     printer(this.state);
    // }

    public execIfAlive(cb: () => void): void {
        if (this.state === CellState.Alive) {
            cb();
        }
    }
}

describe('cell (2. callback for rules)', () => {

    it('a cell updates itself', (cb) => {
        const cell = new Cell(CellState.Dead);
        cell.update(CellState.Alive);
        cell.execIfAlive(cb);
    });

    it('executes a callback if the cell is alive', (cb) => {
        const cell = new Cell(CellState.Alive);
        cell.execIfAlive(cb);
    });

    it('executes a callback if the cell is dead', () => {
        const cell = new Cell(CellState.Dead);
        cell.execIfAlive(() => {
            throw new Error();
        });
    });

    // finished
});

class PositionAwareCell {
    constructor(private x: number, private y: number, private cell: Cell) {
    }

    public execIfNear(x: number, y: number, cb: (cell: Cell) => void): void {
        const isInBoundingBox1 = Math.abs(x - this.x) <= 1 && Math.abs(y - this.y) <= 1;
        const isItself = x == this.x && y == this.y;
        if (isInBoundingBox1 && !isItself) {
            cb(this.cell);
        }
    }

}

class Grid {
    private cells: PositionAwareCell[] = [];

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
        // const _getCellState = (f: (cell: CellState) => void) => {
        //     return (cell: Cell) => cell.print((cellState) => f(cellState));
        // };
        // const _ifCellAlive = (f: () => void) => {
        //     return (cellState: CellState) => {
        //         if (cellState === CellState.Alive) {
        //             f();
        //         }
        //     };
        // };
        // const _inc = () => {
        //     neighboursCount++;
        // };
        // // TODO Can we use currying on TDA?
        // _eachCell(_getCellState(_ifCellAlive(_inc)))(this);
        // // Explicit callbacks had any type, now TS is deriving the exact type for us.

        cb(neighboursCount);
    }

    public put(x: number, y: number, cell: Cell): void {
        this.cells.push(new PositionAwareCell(x, y, cell));
    }

    private eachAliveCellAround(x: number, y: number, cb: () => void): void {
        this.cells.forEach(cell =>
            cell.execIfNear(x, y, cell => cell.execIfAlive(cb)));
    }
}

describe('grid (3. countNeighbours will be used in rules)', () => {

    it('counts neighbours in empty grid', (cb) => {
        const grid = new Grid();

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count single alive neighbors not in corner', (cb) => {
        // Continued where do neighbours come from
        const grid = new Grid();
        grid.put(0, 0, new Cell(CellState.Alive));

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(1);
            cb();
        });
    });

    it('do not count dead neighbors not in corner', (cb) => {
        const grid = new Grid();
        grid.put(0, 0, new Cell(CellState.Dead));

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count two alive neighbors not in corner', (cb) => {
        const grid = new Grid();
        grid.put(0, 0, new Cell(CellState.Alive));
        grid.put(0, 1, new Cell(CellState.Alive));

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(2);
            cb();
        });
    });

    it('count zero alive neighbours with other alive cells not near', (cb) => {
        const grid = new Grid();
        grid.put(0, 0, new Cell(CellState.Alive));

        grid.countLivingNeighboursAt(2, 2, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count not itself', (cb) => {
        const grid = new Grid();
        grid.put(0, 0, new Cell(CellState.Alive));

        grid.countLivingNeighboursAt(0, 0, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    // counting neighbours is finished
});

class Game {
    public seed(x: number, y: number): void {

    }

    public print(leftX: number, upperY: number, rightX: number, lowerY: number, cb: (output: string) => void): void {
        cb(' X \n' +
            ' X \n' +
            ' X \n');
    }
}

describe('(callback for countNeighboursAt)', () => {
    it('prints the board', cb => {
        const game = new Game();
        game.seed(1, 0);
        game.seed(1, 1);
        game.seed(1, 2);

        game.print(0, 0, 3, 3, output => {
            expect(output).equals(
                ' X \n' +
                ' X \n' +
                ' X \n'
            );
            cb();
        });
    });
});
