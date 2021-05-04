import { MachinePlayer } from "./machinePlayer.js";
const startBtn = document.getElementById("start-btn");
const trainBtn = document.getElementById("train-btn");
const choiceField = document.getElementById("choice-field");
let computer1;
let computer2;
let gameOver;
let numOfCoin = 10;
let maxPickable = 3;
let mover;
let gameStartWithP1;
let gameStartWithP2;
let totalGame;
let p1WinTime;
let p2WinTime;
function setupNewGame(isTraining) {
    gameOver = false;
    numOfCoin = 10;
    // randomly decide the first mover
    if (Math.random() >= 0.5) {
        mover = 1;
        gameStartWithP1++;
    }
    else {
        mover = 2;
        gameStartWithP2++;
    }
    if (!isTraining) {
        console.log(Array(numOfCoin + 1).join("● "));
    }
}
function makeMove(mp, opponent) {
    let numTook = 0;
    mp.makeMove(numOfCoin);
    numTook = mp.currentPick;
    while (numTook > numOfCoin) {
        mp.receiveFeedback(-2);
        numTook = mp.currentPick;
    }
    numOfCoin -= numTook;
    if (opponent == "human") {
        console.log(`Machine picked ${numTook}`);
        console.log(Array(numOfCoin + 1).join("● "));
    }
}
function judge(roles) {
    if (numOfCoin == 0) {
        if (mover == 1) {
            p2WinTime++;
            if (roles[0] instanceof MachinePlayer) {
                roles[0].receiveFeedback(-1);
                roles[0].refreshPath();
            }
            if (roles[1] instanceof MachinePlayer) {
                roles[1].receiveFeedback(1);
                roles[1].refreshPath();
            }
        }
        else {
            p1WinTime++;
            if (roles[0] instanceof MachinePlayer) {
                roles[0].receiveFeedback(1);
                roles[0].refreshPath();
            }
            if (roles[1] instanceof MachinePlayer) {
                roles[1].receiveFeedback(-1);
                roles[1].refreshPath();
            }
        }
        if (roles.some((e) => e == "human")) {
            console.log(`Player${mover} wins!`);
        }
        gameOver = true;
        totalGame++;
    }
    mover = -1 * mover + 3;
}
function train(times, machines) {
    totalGame = 0;
    gameStartWithP1 = 0;
    gameStartWithP2 = 0;
    p1WinTime = 0;
    p2WinTime = 0;
    setupNewGame(true);
    while (!gameOver) {
        if (mover == 1) {
            makeMove(machines[0], "computer");
            judge(machines);
            if (totalGame == times)
                return;
            if (gameOver) {
                setupNewGame(true);
                if (mover == 1)
                    continue;
            }
        }
        makeMove(machines[1], "computer");
        judge(machines);
        if (totalGame == times)
            return;
        if (gameOver) {
            setupNewGame(true);
        }
    }
}
function printTrainResult() {
    console.log(`Game start with P1: ${gameStartWithP1} / P2: ${gameStartWithP2}`);
    console.log(`P1 winning rate: ${p1WinTime / totalGame * 100}%`);
    console.log(`P2 winning rate: ${p2WinTime / totalGame * 100}%`);
    console.log(computer1.table);
    console.log(computer2.table);
}
function humanStartPlay(roles) {
    createChoiceBtn(roles);
    setupNewGame(false);
    notifyNextPlayer(roles);
}
function createChoiceBtn(roles) {
    if (choiceField != null) {
        choiceField.innerHTML = "";
        for (let i = 0; i < maxPickable; i++) {
            let btn = document.createElement("button");
            btn.className = "choice-btn";
            btn.id = `pick-${i + 1}-btn`;
            btn.innerHTML = `${i + 1}`;
            btn.addEventListener("click", (e) => { humanMakeMove(e, roles); });
            choiceField.appendChild(btn);
        }
    }
}
function humanMakeMove(e, roles) {
    if (e.currentTarget instanceof HTMLElement) {
        if (parseInt(e.currentTarget.innerHTML) > numOfCoin) {
            console.log("Unavailable Choice!");
            console.log(Array(numOfCoin + 1).join("● "));
        }
        else {
            console.log(`You picked ${e.currentTarget.innerHTML}`);
            numOfCoin -= parseInt(e.currentTarget.innerHTML);
            console.log(Array(numOfCoin + 1).join("● "));
            judge(roles);
            if (!gameOver) {
                notifyNextPlayer(roles);
            }
            else if (choiceField != null) {
                choiceField.innerHTML = "";
            }
        }
    }
}
function notifyNextPlayer(roles) {
    const moverInTurn = roles[mover - 1];
    if (moverInTurn instanceof MachinePlayer) {
        makeMove(moverInTurn, "human");
        judge(roles);
        if (gameOver && choiceField != null) {
            choiceField.innerHTML = "";
        }
    }
    else {
        console.log("Please pick a number.");
    }
}
computer1 = new MachinePlayer(numOfCoin, maxPickable);
computer2 = new MachinePlayer(numOfCoin, maxPickable);
trainBtn === null || trainBtn === void 0 ? void 0 : trainBtn.addEventListener("click", () => {
    train(1000, [computer1, computer2]);
    printTrainResult();
});
startBtn === null || startBtn === void 0 ? void 0 : startBtn.addEventListener("click", () => { humanStartPlay(["human", computer1]); });
