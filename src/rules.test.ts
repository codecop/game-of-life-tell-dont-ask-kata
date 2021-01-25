import {expect} from 'chai';

enum Cell {
    Alive, Dead,
}

function applyRules(cs: Cell, neighbourCount: number, cb: (nextcell: Cell) => void): void {
    const willLive = neighbourCount === 3 || (neighbourCount === 2 && cs === Cell.Alive);
    cb(willLive ? Cell.Alive : Cell.Dead);
}

// class NeighbourCounter {
//     private neighbourCount = 0;
//
//     public inc(): void {
//         this.neighbourCount++;
//     }
//
//     public applyRules(cs: Cell, cb: (nextcell: Cell) => void): void {
//         const willLive = this.neighbourCount === 3 || (this.neighbourCount === 2 && cs === Cell.Alive);
//         cb(willLive ? Cell.Alive : Cell.Dead);
//     }
// }

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
    private cachedState: Cell;

    constructor(private state: Cell) {
        this.cachedState = Cell.Dead;
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

    public applyRulesCache(count: number) {
        applyRules(this.state, count, (newState) => this.cachedState = newState);
    }

    public flipCache() {
        this.state = this.cachedState;
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
        cell.applyRulesCache(2);
        cell.flipCache();
        cell.execIfAlive(cb);
    });

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

    public applyRulesCache(x: number, count: number) {
        this.columns[x].applyRulesCache(count);
    }

    public flipCache(x: number) {
        this.columns[x].flipCache();
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

    public applyRules(x: number, y: number): void {
        let neighboursCount = 0;

        this.rows[y - 1]?.eachLiveCellInBounds(x, () => neighboursCount++);
        this.rows[y].eachLiveCellAround(x, () => neighboursCount++);
        this.rows[y + 1]?.eachLiveCellInBounds(x, () => neighboursCount++);

        this.rows[y].applyRulesCache(x, neighboursCount);
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

    // v2
    public flipCache(x: number, y: number) {
        this.rows[y].flipCache(x);
    }
}

class Game {
    private grid: Grid;

    constructor(private sizeX: number, private sizeY: number) {
        this.grid = new Grid(sizeX, sizeY);
    }

    public seed(x: number, y: number): void {
        this.grid.update(x, y, Cell.Alive);
    }

    public tickCache() {
        for (let y = 0; y < this.sizeY; y++) {
            for (let x = 0; x < this.sizeX; x++) {
                this.grid.applyRules(x, y);
            }
        }

        for (let y = 0; y < this.sizeY; y++) {
            for (let x = 0; x < this.sizeX; x++) {
                this.grid.flipCache(x, y);
            }
        }
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

    it('iterates the board (version 3 with cached state)', cb => {
        const game = new Game(3, 3);
        game.seed(1, 0);
        game.seed(1, 1);
        game.seed(1, 2);

        game.tickCache();

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

// TODO Counter Objeckt statt Callback bei Nachbar zählen
// Idee: Statt Callback bei isAlive einfach den Counter übergeben
// -> weniger Callback, weniger generisch, mehr Kopplung

// TODO alle Callbacks prüfen ob wir sie brauchen

// TODO seed method for tests for readability (but not related to TDA)
