import { MachinePlayer, RandomPlayer } from "./machinePlayer.js";
const restartBtn = document.getElementById("restart-btn");
const startBtn = document.getElementById("start-btn");
const trainBtn = document.getElementById("train-btn");
const choiceField = document.getElementById("choice-field");
const coinDesk = document.getElementById("coin-desk");
const opponentChoiceMsg = document.getElementById("opponent-choice-msg");
const myChoiceMsg = document.getElementById("my-choice-msg");
const unavailableChoiceDiv = document.getElementById("unavailable-choice");
let gameOver;
let initialNumOfCoin = 10;
let maxPickable = 3;
let gameStartWithP1;
let gameStartWithP2;
let gamePlayed;
function setupNewGame(playerList) {
    gameOver = false;
    let startPlayerId;
    // randomly decide the first mover
    if (Math.random() >= 0.5) {
        startPlayerId = 1;
        gameStartWithP1++;
    }
    else {
        startPlayerId = 2;
        gameStartWithP2++;
    }
    return {
        currentNumOfCoin: initialNumOfCoin,
        currentPlayer: playerList[-1 * startPlayerId + 2],
        nextPlayer: playerList[startPlayerId - 1]
    };
}
function machinePlayerMakeMove(gameStatus) {
    let numTook;
    if (gameStatus.nextPlayer instanceof MachinePlayer) {
        numTook = gameStatus.nextPlayer.makeMove(gameStatus.currentNumOfCoin);
        while (numTook > gameStatus.currentNumOfCoin) {
            let repickNumOfCoin = gameStatus.nextPlayer.receiveFeedback(-2);
            if (typeof repickNumOfCoin == "number")
                numTook = repickNumOfCoin;
        }
        if (gameStatus.currentPlayer == "human") {
            if (coinDesk instanceof HTMLElement && opponentChoiceMsg instanceof HTMLElement) {
                removeCoinDiv(coinDesk, numTook);
                createAndPutCoinDiv(opponentChoiceMsg, numTook);
            }
        }
        return {
            currentNumOfCoin: gameStatus.currentNumOfCoin - numTook,
            currentPlayer: gameStatus.nextPlayer,
            nextPlayer: gameStatus.currentPlayer
        };
    }
    else {
        throw (`Next player should be a MachinePlayer, not ${gameStatus.nextPlayer}`);
    }
}
function judge(gameStatus, playerList) {
    if (gameStatus.currentNumOfCoin == 0) {
        let loser = gameStatus.currentPlayer;
        let winner = gameStatus.nextPlayer;
        if (winner instanceof MachinePlayer)
            winner.winTimes++;
        if (loser instanceof MachinePlayer) {
            loser.receiveFeedback(-1);
            loser.refreshPath();
        }
        if (winner instanceof MachinePlayer) {
            winner.receiveFeedback(1);
            winner.refreshPath();
        }
        if (playerList.some((e) => e == "human")) {
            const msgDiv = document.createElement("div");
            if (loser == "human")
                msgDiv.innerHTML = "Computer wins!";
            else
                msgDiv.innerHTML = "You wins!";
            coinDesk === null || coinDesk === void 0 ? void 0 : coinDesk.appendChild(msgDiv);
        }
        gameOver = true;
        gamePlayed++;
    }
    // mover = -1 * mover + 3;
}
function train(times, machines) {
    gamePlayed = 0;
    gameStartWithP1 = 0;
    gameStartWithP2 = 0;
    let gameStatus = setupNewGame(machines);
    while (!gameOver) {
        gameStatus = machinePlayerMakeMove(gameStatus);
        judge(gameStatus, machines);
        if (gamePlayed == times)
            break;
        if (gameOver)
            gameStatus = setupNewGame(machines);
    }
}
function printTrainResult(playerList) {
    console.log(`Game start with P1: ${gameStartWithP1} / P2: ${gameStartWithP2}`);
    console.log(`P1 winning rate: ${Math.round(playerList[0].winTimes / gamePlayed * 10000) / 100}%`);
    console.log(`P2 winning rate: ${Math.round(playerList[1].winTimes / gamePlayed * 10000) / 100}%`);
    console.log(playerList[0].table);
    console.log(playerList[1].table);
}
function humanStartPlay(playerList) {
    if (startBtn instanceof HTMLButtonElement && trainBtn instanceof HTMLButtonElement && myChoiceMsg instanceof HTMLElement && coinDesk instanceof HTMLElement) {
        startBtn.disabled = true;
        trainBtn.disabled = true;
        // remove whatever event listener from startBtn and trainBtn
        startBtn.replaceWith(startBtn.cloneNode(true));
        trainBtn.replaceWith(trainBtn.cloneNode(true));
        coinDesk.innerHTML = "";
        myChoiceMsg.innerHTML = "";
        let gameStatus = setupNewGame(playerList);
        createChoiceBtn();
        createAndPutCoinDiv(coinDesk, gameStatus.currentNumOfCoin);
        notifyNextPlayer(gameStatus, playerList);
    }
}
function createChoiceBtn() {
    if (choiceField instanceof HTMLElement) {
        choiceField.innerHTML = "";
        for (let i = 0; i < maxPickable; i++) {
            let btn = document.createElement("button");
            btn.className = "choice-btn";
            btn.id = `pick-${i + 1}-btn`;
            btn.innerHTML = `Pick ${i + 1}`;
            btn.setAttribute("value", `${i + 1}`);
            choiceField.appendChild(btn);
        }
    }
}
function showUnavailableChoiceError() {
    if (unavailableChoiceDiv !== null) {
        unavailableChoiceDiv.style.display = "flex";
        setTimeout(() => {
            unavailableChoiceDiv.style.opacity = "100%";
            setTimeout(() => {
                unavailableChoiceDiv.style.opacity = "0%";
                setTimeout(() => {
                    unavailableChoiceDiv.style.display = "none";
                }, 300);
            }, 1000);
        });
    }
}
function humanMakeMove(e, gameStatus, playerList) {
    if (e.currentTarget instanceof HTMLElement && coinDesk instanceof HTMLElement && myChoiceMsg instanceof HTMLElement && choiceField instanceof HTMLElement) {
        const pickNumStr = e.currentTarget.getAttribute("value");
        if (pickNumStr != null) {
            const pickNum = parseInt(pickNumStr);
            if (pickNum > gameStatus.currentNumOfCoin)
                showUnavailableChoiceError();
            else {
                let newGameStatus = {
                    currentNumOfCoin: gameStatus.currentNumOfCoin - pickNum,
                    currentPlayer: gameStatus.nextPlayer,
                    nextPlayer: gameStatus.currentPlayer
                };
                removeCoinDiv(coinDesk, pickNum);
                createAndPutCoinDiv(myChoiceMsg, pickNum);
                removeHumanChoiceBtnsEventListener();
                judge(newGameStatus, playerList);
                if (!gameOver) {
                    setTimeout(() => notifyNextPlayer(newGameStatus, playerList), 1000);
                }
                else
                    choiceField.innerHTML = "";
            }
        }
    }
}
function removeCoinDiv(targetDiv, numToRemove) {
    for (let i = 0; i < numToRemove; i++) {
        const movedCoin = targetDiv.childNodes[0];
        if (movedCoin instanceof HTMLElement)
            targetDiv.removeChild(movedCoin);
    }
}
function createAndPutCoinDiv(divToPut, numToCreate) {
    for (let i = 0; i < numToCreate; i++) {
        let coinDiv = document.createElement("div");
        coinDiv.className = "coin";
        coinDiv.innerHTML = "C";
        divToPut.appendChild(coinDiv);
    }
}
function notifyNextPlayer(gameStatus, playerList) {
    if (gameStatus.nextPlayer instanceof MachinePlayer) {
        let newGameStatus = machinePlayerMakeMove(gameStatus);
        judge(newGameStatus, playerList);
        if (gameOver && choiceField instanceof HTMLElement)
            choiceField.innerHTML = "";
        else
            addHumanChoiceBtnsEventListener(newGameStatus, playerList);
    }
    else
        addHumanChoiceBtnsEventListener(gameStatus, playerList);
}
function removeHumanChoiceBtnsEventListener() {
    const allChoiceBtns = document.getElementsByClassName("choice-btn");
    for (let eachBtn of allChoiceBtns) {
        eachBtn.replaceWith(eachBtn.cloneNode(true));
    }
}
function addHumanChoiceBtnsEventListener(gameStatus, playerList) {
    const allChoiceBtns = document.getElementsByClassName("choice-btn");
    for (let eachBtn of allChoiceBtns) {
        eachBtn.addEventListener("click", (e) => {
            humanMakeMove(e, gameStatus, playerList);
        });
    }
}
if (trainBtn instanceof HTMLElement && startBtn instanceof HTMLElement && restartBtn instanceof HTMLElement) {
    let computer1 = new MachinePlayer(initialNumOfCoin, maxPickable);
    let computer2 = new RandomPlayer(initialNumOfCoin, maxPickable);
    trainBtn.addEventListener("click", (e) => {
        if (trainBtn instanceof HTMLButtonElement) {
            trainBtn.disabled = true;
            // remove whatever event listener from trainBtn
            trainBtn.replaceWith(trainBtn.cloneNode(true));
        }
        let batchTrainTime = 500;
        while (computer1.winTimes < batchTrainTime * .99) {
            computer1.winTimes = 0;
            computer2.winTimes = 0;
            train(batchTrainTime, [computer1, computer2]);
            printTrainResult([computer1, computer2]);
        }
        if (coinDesk instanceof HTMLElement)
            coinDesk.innerHTML = "Computer Trained!";
    });
    startBtn.addEventListener("click", () => humanStartPlay(["human", computer1]));
    restartBtn.addEventListener("click", () => location.reload());
}
