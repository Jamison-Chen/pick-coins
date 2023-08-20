export class MachinePlayer {
    constructor(initialNumOfCoin, maxPickable) {
        this._maxPickable = maxPickable;
        this._table = Array(initialNumOfCoin)
            .fill(null)
            .map(() => Array(maxPickable).fill(0));
        this._path = [];
        this._lr = 0.5;
        this._discountRate = 0.5;
        this.winTimes = 0;
    }
    get table() {
        return this._table;
    }
    appendOnPath(coinRest, numTook) {
        this._path.push([coinRest, numTook]);
    }
    refreshPath() {
        this._path = [];
    }
    receiveFeedback(feedBack) {
        const targetRowIdx = this._path[this._path.length - 1][0] - 1;
        const targetColumnIdx = this._path[this._path.length - 1][1] - 1;
        if (feedBack == 1) {
            this._table[targetRowIdx][targetColumnIdx] += 10;
        }
        else if (feedBack == -1) {
            this._table[targetRowIdx][targetColumnIdx] -= 10;
        }
        else if (feedBack == -2) {
            this.updateScoresOfARow(targetRowIdx + 1, true);
            this._table[targetRowIdx][targetColumnIdx] = -1 * Infinity;
            this._path.pop();
            return this.makeMove(targetRowIdx + 1);
        }
    }
    makeMove(restCoin) {
        this.updateScoresOfARow(restCoin, false);
        const targetRow = this._table[restCoin - 1];
        let numTake;
        let maxScore;
        if (targetRow.every((i) => i == 0)) {
            numTake = Math.floor(Math.random() * this._maxPickable) + 1;
            maxScore = targetRow[numTake - 1];
        }
        else {
            maxScore = targetRow[0];
            numTake = 1;
            for (let i = 0; i < targetRow.length; i++) {
                if (targetRow[i] > maxScore) {
                    maxScore = targetRow[i];
                    numTake = i + 1;
                }
            }
        }
        this.appendOnPath(restCoin, numTake);
        return numTake;
    }
    updateScoresOfARow(restCoin, reverse) {
        const sign = reverse ? -1 : 1;
        for (let i = 1; i <= this._maxPickable; i++) {
            if (i <= restCoin) {
                this._table[restCoin - 1][i - 1] +=
                    sign * this._lr * this.calcScore(restCoin, i);
            }
        }
    }
    calcScore(restCoin, numTake) {
        const restCoinIfYouTakeN = restCoin - numTake;
        if (restCoinIfYouTakeN > 1) {
            let concernPart = [];
            for (let i = 0; i < Math.min(this._maxPickable, restCoinIfYouTakeN - 1); i++) {
                concernPart.push(this._table[restCoinIfYouTakeN - 1 - 1 - i]);
            }
            for (let eachRow of concernPart) {
                if (eachRow.every((i) => i < 0)) {
                    return Math.max(...eachRow) * this._discountRate;
                }
            }
            for (let eachRow of concernPart) {
                if (eachRow.every((i) => i == 0))
                    return 0;
            }
            let oneDArray = [];
            for (let eachRow of concernPart) {
                for (let eachScore of eachRow)
                    oneDArray.push(eachScore);
            }
            return Math.max(...oneDArray) * this._discountRate;
        }
        else
            return 0;
    }
}
export class RandomPlayer extends MachinePlayer {
    makeMove(restCoin) {
        return Math.floor(Math.random() * Math.min(this._maxPickable, restCoin) + 1);
    }
    receiveFeedback(feedBack) { }
}
