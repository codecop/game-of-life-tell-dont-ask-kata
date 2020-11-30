import { expect } from 'chai';

function applyRules(cs: CellState, neighbourCount: number, cb: (nextCellState: CellState) => void) {
    // TODO finish, not related to TDA
    cb(CellState.Dead);
}

enum CellState {
    Alive, Dead,
}

describe('rules', () => {
    it('a cell without neighbours dies', (cb) => {
        // 1. start rules
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

    public update(newState: CellState) {
        this.state = newState;
    }

    public print(printer: (nextCellState: CellState) => void) {
        printer(this.state);
    }

    execIfAlive(cb: () => void) {
        if(this.state === CellState.Alive) {
            cb()
        }
    }
}

describe('cell', () => {
    it('a cell updates itself', (cb) => {
        // 2. what is callback for rules
        const cell = new Cell(CellState.Alive);
        cell.update(CellState.Dead);
        cell.print((nextCellState) => {
            expect(nextCellState).to.equal(CellState.Dead);
            cb();
        });
    });
    it('executes a callback if the cell is alive', (cb) => {
        const cell = new Cell(CellState.Alive);
        cell.execIfAlive(cb)
    });
    it('executes a callback if the cell is dead', () => {
        const cell = new Cell(CellState.Dead);
        cell.execIfAlive(() => {
            throw new Error();
        })
    });
});

class Grid {
    private cells: Array<{ x: number, y: number, cell: Cell }> = [];

    public countLivingNeighboursAt(x: number, y: number, cb: (neighboursCount: number) => void) {
        let neighboursCount = 0;
        this.eachAliveCell(() => neighboursCount++);

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

    public put(x: number, y: number, cell: Cell) {
        this.cells.push({ x, y, cell });
    }

    public eachCell(body: (c: Cell) => void) {
        this.cells.forEach(({ cell }) => body(cell));
    }
    private eachAliveCell(cb: () => void) {
        this.cells.forEach(({ cell }) => cell.execIfAlive(cb));
    }
}

describe('grid', () => {

    it('counts neighbours in empty grid', (cb) => {
        // 3. where do neighbours come from
        const grid = new Grid();

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(0);
            cb();
        });
    });

    it('count single alive neighbors not in corner', (cb) => {
        // 3.5. where do neighbours come from
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

    it('grid should contain cells', (cb) => {
        // 4. what is callback of countNeighboursAt
        const grid = new Grid();
        const cell = new Cell(CellState.Alive);
        grid.put(0, 0, cell);

        grid.eachCell((c) => {
            expect(c).to.deep.equal(cell);
            cb();
        });
    });
});
