import { MachinePlayer } from "./machinePlayer.js";
const restartBtn = document.getElementById("restart-btn");
const startBtn = document.getElementById("start-btn");
const trainBtn = document.getElementById("train-btn");
const choiceField = document.getElementById("choice-field");
const coinDesk = document.getElementById("coin-desk");
const opponentChoiceMsg = document.getElementById("opponent-choice-msg");
const myChoiceMsg = document.getElementById("my-choice-msg");

let computer1: MachinePlayer;
let computer2: MachinePlayer;
let gameOver: boolean;
let numOfCoin: number = 10;
let maxPickable: number = 3;
let mover: number;
let gameStartWithP1: number;
let gameStartWithP2: number;
let totalGame: number;
let p1WinTime: number;
let p2WinTime: number;

function setupNewGame(): void {
    gameOver = false;
    numOfCoin = 10;
    // randomly decide the first mover
    if (Math.random() >= 0.5) {
        mover = 1;
        gameStartWithP1++;
    } else {
        mover = 2;
        gameStartWithP2++;
    }
}

function makeMove(mp: MachinePlayer, opponent: string): void {
    let numTook: number = 0;
    mp.makeMove(numOfCoin);
    numTook = mp.currentPick;
    while (numTook > numOfCoin) {
        mp.receiveFeedback(-2);
        numTook = mp.currentPick;
    }
    numOfCoin -= numTook;
    if (opponent == "human") {
        if (coinDesk != null && opponentChoiceMsg != null) {
            for (let i = 0; i < numTook; i++) {
                const movedCoin = coinDesk.childNodes[0];
                if (movedCoin instanceof HTMLElement) {
                    coinDesk.removeChild(movedCoin);
                }
            }
            const msgDiv = document.createElement("div");
            msgDiv.innerHTML = `Computer picked ${numTook}`;
            opponentChoiceMsg.appendChild(msgDiv);
        }
    }
}

function judge(roles: (string | MachinePlayer)[]): void {
    if (numOfCoin == 0) {
        if (mover == 1) {
            p2WinTime++;
        } else {
            p1WinTime++;
        }
        let loser = roles[mover - 1];
        // -1 * mover + 2 => input 1 output 1, input 2 output 0
        let winner = roles[-1 * mover + 2];
        if (loser instanceof MachinePlayer) {
            loser.receiveFeedback(-1);
            loser.refreshPath();
        }
        if (winner instanceof MachinePlayer) {
            winner.receiveFeedback(1);
            winner.refreshPath();
        }

        if (roles.some((e) => e == "human")) {
            const msgDiv = document.createElement("div");
            if (loser == "human") {
                msgDiv.innerHTML = "Computer wins!";
            } else {
                msgDiv.innerHTML = "You wins!";
            }
            coinDesk?.appendChild(msgDiv);
        }
        gameOver = true;
        totalGame++;
    }
    mover = -1 * mover + 3;
}

function train(times: number, machines: [MachinePlayer, MachinePlayer]): void {
    totalGame = 0;
    gameStartWithP1 = 0;
    gameStartWithP2 = 0;
    p1WinTime = 0;
    p2WinTime = 0;
    setupNewGame();
    while (!gameOver) {
        makeMove(machines[mover - 1], "computer");
        judge(machines);
        if (totalGame == times) return;
        if (gameOver) setupNewGame();
    }
}

function printTrainResult(): void {
    console.log(`Game start with P1: ${gameStartWithP1} / P2: ${gameStartWithP2}`);
    console.log(`P1 winning rate: ${p1WinTime / totalGame * 100}%`);
    console.log(`P2 winning rate: ${p2WinTime / totalGame * 100}%`);
    console.log(computer1.table);
    console.log(computer2.table);
}

function humanStartPlay(roles: (string | MachinePlayer)[]): void {
    if (startBtn instanceof HTMLButtonElement && trainBtn instanceof HTMLButtonElement) {
        startBtn.disabled = true;
        trainBtn.disabled = true;
        // remove event listener
        startBtn.replaceWith(startBtn.cloneNode(true));
        trainBtn.replaceWith(trainBtn.cloneNode(true));
    }
    createChoiceBtn(roles);
    setupNewGame();
    createCoinDiv();
    notifyNextPlayer(roles);
}

function createChoiceBtn(roles: (string | MachinePlayer)[]): void {
    if (choiceField != null) {
        choiceField.innerHTML = "";
        for (let i = 0; i < maxPickable; i++) {
            let btn = document.createElement("button");
            btn.className = "choice-btn";
            btn.id = `pick-${i + 1}-btn`;
            btn.innerHTML = `Pick ${i + 1}`;
            btn.setAttribute("value", `${i + 1}`);
            btn.addEventListener("click", (e) => { humanMakeMove(e, roles) });
            choiceField.appendChild(btn);
        }
    }
}

function humanMakeMove(e: Event, roles: (string | MachinePlayer)[]): void {
    if (e.currentTarget instanceof HTMLElement && coinDesk != null && myChoiceMsg != null) {
        const pickNumStr = e.currentTarget.getAttribute("value");
        if (pickNumStr != null) {
            const pickNum = parseInt(pickNumStr);
            const msgDiv = document.createElement("div");
            if (pickNum > numOfCoin) {
                msgDiv.innerHTML = "Unavailable Choice!";
            } else {
                for (let i = 0; i < pickNum; i++) {
                    const movedCoin = coinDesk.childNodes[0];
                    if (movedCoin instanceof HTMLElement) {
                        coinDesk.removeChild(movedCoin);
                    }
                }
                msgDiv.innerHTML = `You picked ${pickNum}`;
                numOfCoin -= pickNum;
                judge(roles);
                if (!gameOver) {
                    notifyNextPlayer(roles);
                } else if (choiceField != null) {
                    choiceField.innerHTML = "";
                }
            }
            while (myChoiceMsg.childNodes.length > 4) {
                myChoiceMsg.removeChild(myChoiceMsg.childNodes[0]);
            }
            myChoiceMsg.appendChild(msgDiv);
        }
    }
}

function createCoinDiv(): void {
    if (coinDesk != null) {
        coinDesk.innerHTML = "";
        for (let i = 0; i < numOfCoin; i++) {
            let coinDiv = document.createElement("div");
            coinDiv.className = "coin";
            coinDiv.innerHTML = "C";
            coinDesk.appendChild(coinDiv);
        }
    }
}

function notifyNextPlayer(roles: (string | MachinePlayer)[]): void {
    const moverInTurn = roles[mover - 1];
    if (moverInTurn instanceof MachinePlayer) {
        makeMove(moverInTurn, "human");
        judge(roles);
        if (gameOver && choiceField != null) {
            choiceField.innerHTML = "";
        }
    } else {
        console.log("Please pick a number.")
    }
}

computer1 = new MachinePlayer(numOfCoin, maxPickable);
computer2 = new MachinePlayer(numOfCoin, maxPickable);

if (trainBtn != null && startBtn != null && restartBtn != null) {
    trainBtn.addEventListener("click", (e) => {
        if (trainBtn instanceof HTMLButtonElement && coinDesk != null) {
            trainBtn.disabled = true;
            coinDesk.innerHTML = "Computer Trained!"
            // remove this event listener
            trainBtn.replaceWith(trainBtn.cloneNode(true));
        }
        train(1000, [computer1, computer2]);
        printTrainResult();
    });
    startBtn.addEventListener("click", () => { humanStartPlay(["human", computer1]) });
    restartBtn.addEventListener("click", () => location.reload());
}