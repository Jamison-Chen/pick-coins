import { MachinePlayer } from "./machinePlayer.js";
let computer1;
let computer2;
let machinePlayerList = [];
let gameOver;
let numOfCoin = 10;
let maxPickable = 3;
let mover;
let gameStartWithP1;
let gameStartWithP2;
let totalGame;
let p1WinTime;
let p2WinTime;
function setupNewGame(roles) {
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
    if (!(roles[0] == "computer" && roles[1] == "computer")) {
        console.log(Array(numOfCoin).join("● "));
    }
}
function makeMove(playerNumber, role, opponent) {
    // if (playerNumber == 1) {
    let numTook = 0;
    if (role == "computer") {
        const mp = machinePlayerList[playerNumber - 1];
        mp.makeMove(numOfCoin);
        numTook = mp.currentPick;
        while (numTook > numOfCoin) {
            mp.receiveFeedback(-2);
            numTook = mp.currentPick;
        }
        if (opponent == "human") {
            console.log(`Player${playerNumber} picks ${numTook}`);
        }
    }
    else if (role == "human") {
        let pass = false;
        while (!pass) {
            let input = prompt("Please enter a number");
            // console.log(input == null, input == "", isNaN(parseInt(input)));
            if (input == null || input == "" || isNaN(parseInt(input)))
                continue;
            numTook = parseInt(input);
            if (numTook > Math.min(maxPickable, numOfCoin) || numTook < 1) {
                console.log("Unavailable input!");
            }
            else {
                pass = true;
            }
        }
        console.log(`Player${playerNumber} picks ${numTook}`);
    }
    numOfCoin -= numTook;
    // } else {
    //     if (role == "computer") {
    //     } else if (role == "human") {
    //     }
    // }
}
function judge(lastMoverNumber, roles) {
    if (numOfCoin == 0) {
        if (lastMoverNumber == 1) {
            p2WinTime++;
            if (roles[0] == "computer") {
                machinePlayerList[0].receiveFeedback(-1);
                machinePlayerList[0].refreshPath();
            }
            if (roles[1] == "computer") {
                machinePlayerList[1].receiveFeedback(1);
                machinePlayerList[1].refreshPath();
            }
            if ("human" in roles) {
                console.log("Player2 wins!");
            }
        }
        else {
            p1WinTime++;
            if (roles[0] == "computer") {
                machinePlayerList[0].receiveFeedback(1);
                machinePlayerList[0].refreshPath();
            }
            if (roles[1] == "computer") {
                machinePlayerList[1].receiveFeedback(-1);
                machinePlayerList[1].refreshPath();
            }
            if ("human" in roles) {
                console.log("Player1 wins!");
            }
        }
        gameOver = true;
        totalGame++;
    }
    mover = -1 * lastMoverNumber + 3;
}
function play(times, roles) {
    totalGame = 0;
    gameStartWithP1 = 0;
    gameStartWithP2 = 0;
    p1WinTime = 0;
    p2WinTime = 0;
    setupNewGame(roles);
    while (!gameOver) {
        if (mover == 1) {
            makeMove(mover, roles[0], roles[1]);
            judge(mover, roles);
            if (totalGame == times)
                return;
            if (gameOver) {
                setupNewGame(roles);
                if (mover == 1)
                    continue;
            }
        }
        makeMove(mover, roles[1], roles[0]);
        judge(mover, roles);
        if (totalGame == times)
            return;
        if (gameOver) {
            setupNewGame(roles);
        }
    }
}
function train(times) {
    play(times, ["computer", "computer"]);
}
function printTrainResult() {
    console.log(`Game start with P1: ${gameStartWithP1} / P2: ${gameStartWithP2}`);
    console.log(`P1 winning rate: ${p1WinTime / totalGame * 100}%`);
    console.log(`P2 winning rate: ${p2WinTime / totalGame * 100}%`);
}
computer1 = new MachinePlayer(numOfCoin, maxPickable);
computer2 = new MachinePlayer(numOfCoin, maxPickable);
machinePlayerList.push(computer1);
machinePlayerList.push(computer2);
train(1000);
printTrainResult();
// play(2, ["human", "computer"]);
