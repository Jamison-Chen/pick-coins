export class MachinePlayer {
    protected _maxPickable: number;
    private _table: number[][];
    // Below are how the table looks like...
    // -------------------------------------------------
    //              take1coin    take2coins  take3coins
    // 1coinRest
    // 2coinsRest
    // .
    // .
    // .
    // 10coinsRest
    // -------------------------------------------------
    private _path: number[][];
    private _lr: number;
    private _discountRate: number;
    public winTimes: number;

    constructor(initialNumOfCoin: number, maxPickable: number) {
        this._maxPickable = maxPickable;
        this._table = Array(initialNumOfCoin).fill(null).map(() => Array(maxPickable).fill(0));
        this._path = []; // [[rest coin(s), number took], ...]
        this._lr = 0.5;
        this._discountRate = 0.5;
        this.winTimes = 0;
    }
    public get table(): number[][] {
        return this._table;
    }
    private appendOnPath(coinRest: number, numTook: number): void {
        this._path.push([coinRest, numTook]);
    }
    public refreshPath(): void {
        this._path = [];
    }
    public receiveFeedback(feedBack: 1 | -1 | -2): void | number {
        const targetRowIdx: number = this._path[this._path.length - 1][0] - 1;
        const targetColumnIdx: number = this._path[this._path.length - 1][1] - 1;
        if (feedBack == 1) {    // win
            this._table[targetRowIdx][targetColumnIdx] += 10;
        } else if (feedBack == -1) {    // lose
            this._table[targetRowIdx][targetColumnIdx] -= 10;
        } else if (feedBack == -2) {    // if an invalid move has been made
            // make a deduction (reverse) of the values the latest invalid move added.
            // "targetRowIdx + 1" is the "latest number of coins rest"
            this.updateScoresOfARow(targetRowIdx + 1, true);
            this._table[targetRowIdx][targetColumnIdx] = -1 * Infinity;
            this._path.pop();
            return this.makeMove(targetRowIdx + 1);
        }
    }
    public makeMove(restCoin: number): number {
        // learn something before make choice
        this.updateScoresOfARow(restCoin, false);
        const targetRow: number[] = this._table[restCoin - 1];
        let numTake: number;
        let maxScore: number;
        if (targetRow.every((i) => i == 0)) {
            numTake = Math.floor(Math.random() * this._maxPickable) + 1;
            maxScore = targetRow[numTake - 1];
        } else {
            maxScore = targetRow[0];
            numTake = 1;
            for (let i = 0; i < targetRow.length; i++) {
                if (targetRow[i] > maxScore) {
                    maxScore = targetRow[i];
                    numTake = i + 1;
                }
            }
        }
        this.appendOnPath(restCoin, numTake)
        return numTake;
    }
    private updateScoresOfARow(restCoin: number, reverse: boolean): void {
        const sign = reverse ? -1 : 1;
        for (let i = 1; i <= this._maxPickable; i++) {
            if (i <= restCoin) {
                // Q <- Q + lr * point
                this._table[restCoin - 1][i - 1] += sign * this._lr * this.calcScore(restCoin, i);
            }
        }
    }
    private calcScore(restCoin: number, numTake: number): number {
        const restCoinIfYouTakeN = restCoin - numTake;
        // If, afterwards, your opponent take "m" coins,
        // you will heve "restCoinIfYouTakeN - m" coins rest the next time.
        if (restCoinIfYouTakeN > 1) {
            let concernPart: number[][] = [];
            for (let i = 0; i < Math.min(this._maxPickable, restCoinIfYouTakeN - 1); i++) {
                concernPart.push(this._table[(restCoinIfYouTakeN - 1) - 1 - i]);
            }

            // If there exists any row that all numbers are negative,
            // it means that "take i" now will lead you to failure
            // because your opponent is smart enough to push you to that situation.
            for (let eachRow of concernPart) {
                if (eachRow.every((i) => i < 0)) {
                    return Math.max(...eachRow) * this._discountRate;
                }
            }

            // If there exists any row that all numbers are zero
            // (and no row is all-negative) it means that this choice
            // will lead you to an unknown result.
            for (let eachRow of concernPart) {
                if (eachRow.every((i) => i == 0)) return 0;
            }

            // If non of the above two situations happened...
            let oneDArray: number[] = [];
            for (let eachRow of concernPart) {
                for (let eachScore of eachRow) oneDArray.push(eachScore);
            }
            return Math.max(...oneDArray) * this._discountRate;
        } else return 0;
    }
}

export class RandomPlayer extends MachinePlayer {
    public makeMove(restCoin: number): number {
        return Math.floor(Math.random() * Math.min(this._maxPickable, restCoin) + 1);
    }
    public receiveFeedback(feedBack: number): void | number { }
}