import {expect} from 'chai';

enum Cell {
    Alive, Dead,
}

enum NextGeneration {
    Dead,
    StaysAlive,
    Born
}

class Rules {
    private neighbourCount = 0;

    public incrementNeighbourCount(): void {
        this.neighbourCount++;
    }

    public apply(column: Column): void {
        let nextGeneration;
        if (this.neighbourCount === 3) {
            nextGeneration = NextGeneration.Born;
        } else if (this.neighbourCount === 2) {
            nextGeneration = NextGeneration.StaysAlive;
        } else {
            nextGeneration = NextGeneration.Dead;
        }
        column.applyRules(nextGeneration);
    }
}

describe('rules (1. start rules)', () => {

    it('a cell without neighbours dies', (cb) => {
        const mockColumn = {
            applyRules: (nextGeneration: NextGeneration) => {
                expect(nextGeneration).to.equals(NextGeneration.Dead)
                cb();
            }
        } as unknown as Column;
        const rules = new Rules();
        rules.apply(mockColumn);
    });

    it('an alive cell with two neighbours stays alive', (cb) => {
        const mockColumn = {
            applyRules: (nextGeneration: NextGeneration) => {
                expect(nextGeneration).to.equals(NextGeneration.StaysAlive)
                cb();
            }
        } as unknown as Column;

        const rules = new Rules();
        rules.incrementNeighbourCount();
        rules.incrementNeighbourCount();
        rules.apply(mockColumn);
    });

    // TODO more tests, not related to TDA
});

// Column manages state of cell.
class Column {
    private cachedState: Cell = Cell.Dead;

    constructor(private state: Cell) {
    }

    public update(newState: Cell): void {
        this.state = newState;
    }

    public countAsLiving(rules: Rules): void {
        if (this.state === Cell.Alive) {
            rules.incrementNeighbourCount();
        }
    }

    applyRules(nextGeneration: NextGeneration) {
        const willLive = nextGeneration === NextGeneration.Born || nextGeneration === NextGeneration.StaysAlive && this.state === Cell.Alive;
        if (willLive) {
            this.cachedState = Cell.Alive;
        } else {
            this.cachedState = Cell.Dead;
        }
    }

    public flipCache(): void {
        this.state = this.cachedState;
    }

    public print(cb: (output: string) => void): void {
        if (this.state === Cell.Alive) {
            cb('X');
        } else {
            cb(' ');
        }
    }
}

describe('cell (2. callback for rules)', () => {

    it('a cell updates itself', (cb) => {
        const rulesMock = {
            incrementNeighbourCount: cb
        } as unknown as Rules;
        const cell = new Column(Cell.Dead);
        cell.update(Cell.Alive);
        cell.countAsLiving(rulesMock);
    });

    it('executes a callback if the cell is alive', (cb) => {
        const rulesMock = {
            incrementNeighbourCount: cb
        } as unknown as Rules;
        const cell = new Column(Cell.Alive);
        cell.countAsLiving(rulesMock);
    });

    it('executes a callback if the cell is dead', () => {
        const rulesMock = {
            incrementNeighbourCount: () => {
                throw new Error();
            }
        } as unknown as Rules;
        const cell = new Column(Cell.Dead);
        cell.countAsLiving(rulesMock);
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

    public eachLiveCellInBounds(x: number, rules: Rules): void {
        this.columns[x].countAsLiving(rules);
        this.eachLiveCellAround(x, rules);
    }

    public eachLiveCellAround(x: number, rules: Rules): void {
        this.columns[x - 1]?.countAsLiving(rules);
        this.columns[x + 1]?.countAsLiving(rules);
    }

    public print(cb: (output: string) => void): void {
        this.columns.forEach(cell => {
            cell.print(cb);
        });
    }

    public applyRulesCache(x: number, rules: Rules): void {
        rules.apply(this.columns[x]);
    }

    public flipCache(x: number): void {
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
        const rules = new Rules();

        this.rows[y - 1]?.eachLiveCellInBounds(x, rules);
        this.rows[y].eachLiveCellAround(x, rules);
        this.rows[y + 1]?.eachLiveCellInBounds(x, rules);

        this.rows[y].applyRulesCache(x, rules);
    }

    public update(x: number, y: number, cell: Cell): void {
        this.rows[y].update(x, cell);
    }

    public print(cb: (output: string) => void): void {
        this.rows.forEach(row => {
            row.print(cb);
            cb('\n');
        });
    }

    public flipCache(x: number, y: number): void {
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

    public tickCache(): void {
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

// TODO alle Callbacks prüfen ob wir sie brauchen

// TODO seed method for tests for readability (but not related to TDA)
