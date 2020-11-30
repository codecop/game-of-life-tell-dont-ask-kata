import {expect} from 'chai';

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
});

class Grid {
    private cell: Cell | null = null;

    public countLivingNeighboursAt(x: number, y: number, cb: (neighboursCount: number) => void) {
        if (this.cell == null) {
            cb(0);
            return;
        }

        this.cell.print((cellState) => {
            const neighboursCount = cellState === CellState.Alive ? 1 : 0;
            cb(neighboursCount);
        });
    }

    public put(x: number, y: number, cell: Cell) {
        this.cell = cell;
    }

    public eachCell(body: (c: Cell) => void) {
        if (this.cell) {
            body(this.cell);
        }
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

    it('count alive neighbors not in corner', (cb) => {
        // 3.5. where do neighbours come from
        const grid = new Grid();
        grid.put(0, 0, new Cell(CellState.Alive));

        grid.countLivingNeighboursAt(1, 1, (neighboursCount: number) => {
            expect(neighboursCount).to.equal(1);
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
