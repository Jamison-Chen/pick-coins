import { MachinePlayer, RandomPlayer } from "./machinePlayer.js";

interface GameStatus {
    currentNumOfCoin: number;
    currentPlayer: MachinePlayer | "human";
    nextPlayer: MachinePlayer | "human";
}

const restartBtn = document.getElementById("restart-btn") as HTMLButtonElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const trainBtn = document.getElementById("train-btn") as HTMLButtonElement;
const choiceField: HTMLElement = document.getElementById("choice-field")!;
const publicDesk: HTMLElement = document.getElementById("public-desk")!;
const opponentDesk: HTMLElement = document.getElementById("opponent-desk")!;
const myDesk: HTMLElement = document.getElementById("my-desk")!;
const warningMessageDiv: HTMLElement =
    document.getElementById("warning-message")!;
const hintDiv: HTMLElement = document.getElementById("hint")!;

let gameOver: boolean;
let initialNumOfCoin = 10;
let maxPickable: number = 3;
let gameStartWithP1: number;
let gameStartWithP2: number;
let gamePlayed: number;

function setupNewGame(playerList: (MachinePlayer | "human")[]): GameStatus {
    gameOver = false;
    let startPlayerId: number;
    // randomly decide the first mover
    if (Math.random() >= 0.5) {
        startPlayerId = 1;
        gameStartWithP1++;
    } else {
        startPlayerId = 2;
        gameStartWithP2++;
    }
    return {
        currentNumOfCoin: initialNumOfCoin,
        currentPlayer: playerList[-1 * startPlayerId + 2],
        nextPlayer: playerList[startPlayerId - 1],
    };
}

function machinePlayerMakeMove(gameStatus: GameStatus): GameStatus {
    let numTook: number;
    if (gameStatus.nextPlayer instanceof MachinePlayer) {
        numTook = gameStatus.nextPlayer.makeMove(gameStatus.currentNumOfCoin);
        while (numTook > gameStatus.currentNumOfCoin) {
            let repickNumOfCoin = gameStatus.nextPlayer.receiveFeedback(-2);
            if (typeof repickNumOfCoin == "number") numTook = repickNumOfCoin;
        }
        if (gameStatus.currentPlayer == "human") {
            removeCoinDiv(publicDesk, numTook);
            createAndPutCoinDiv(opponentDesk, numTook);
        }
        return {
            currentNumOfCoin: gameStatus.currentNumOfCoin - numTook,
            currentPlayer: gameStatus.nextPlayer,
            nextPlayer: gameStatus.currentPlayer,
        };
    } else {
        throw `Next player should be a MachinePlayer, not ${gameStatus.nextPlayer}`;
    }
}

function judge(
    gameStatus: GameStatus,
    playerList: (MachinePlayer | "human")[]
): void {
    if (gameStatus.currentNumOfCoin == 0) {
        let loser = gameStatus.currentPlayer;
        let winner = gameStatus.nextPlayer;
        if (winner instanceof MachinePlayer) winner.winTimes++;
        if (loser instanceof MachinePlayer) {
            loser.receiveFeedback(-1);
            loser.refreshPath();
        }
        if (winner instanceof MachinePlayer) {
            winner.receiveFeedback(1);
            winner.refreshPath();
        }
        if (playerList.some((e) => e == "human")) {
            if (loser == "human") hintDiv.innerHTML = "Computer wins!";
            else hintDiv.innerHTML = "You wins!";
            hintDiv.style.display = "flex";
        }
        gameOver = true;
        gamePlayed++;
    }
    // mover = -1 * mover + 3;
}

function train(times: number, machines: [MachinePlayer, MachinePlayer]): void {
    gamePlayed = 0;
    gameStartWithP1 = 0;
    gameStartWithP2 = 0;
    let gameStatus = setupNewGame(machines);
    while (!gameOver) {
        gameStatus = machinePlayerMakeMove(gameStatus);
        judge(gameStatus, machines);
        if (gamePlayed == times) break;
        if (gameOver) gameStatus = setupNewGame(machines);
    }
}

function printTrainResult(playerList: [MachinePlayer, MachinePlayer]): void {
    console.log(
        `Game start with P1: ${gameStartWithP1} / P2: ${gameStartWithP2}`
    );
    console.log(
        `P1 winning rate: ${
            Math.round((playerList[0].winTimes / gamePlayed) * 10000) / 100
        }%`
    );
    console.log(
        `P2 winning rate: ${
            Math.round((playerList[1].winTimes / gamePlayed) * 10000) / 100
        }%`
    );
    console.log(playerList[0].table);
    console.log(playerList[1].table);
}

function humanStartPlay(playerList: ("human" | MachinePlayer)[]): void {
    startBtn.disabled = true;
    trainBtn.disabled = true;
    // remove whatever event listener from startBtn and trainBtn
    startBtn.replaceWith(startBtn.cloneNode(true));
    trainBtn.replaceWith(trainBtn.cloneNode(true));
    hintDiv.style.display = "none";
    publicDesk.innerHTML = "";
    myDesk.innerHTML = "";
    let gameStatus: GameStatus = setupNewGame(playerList);
    createChoiceBtn();
    createAndPutCoinDiv(publicDesk, gameStatus.currentNumOfCoin);
    notifyNextPlayer(gameStatus, playerList);
}

function createChoiceBtn(): void {
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

function showUnavailableChoiceError(): void {
    warningMessageDiv.style.display = "flex";
    setTimeout(() => (warningMessageDiv.style.display = "none"), 1000);
}

function humanMakeMove(
    e: Event,
    gameStatus: GameStatus,
    playerList: ("human" | MachinePlayer)[]
): void {
    if (e.currentTarget instanceof HTMLElement) {
        const pickNumStr = e.currentTarget.getAttribute("value");
        if (pickNumStr != null) {
            const pickNum = parseInt(pickNumStr);
            if (pickNum > gameStatus.currentNumOfCoin)
                showUnavailableChoiceError();
            else {
                let newGameStatus: GameStatus = {
                    currentNumOfCoin: gameStatus.currentNumOfCoin - pickNum,
                    currentPlayer: gameStatus.nextPlayer,
                    nextPlayer: gameStatus.currentPlayer,
                };
                removeCoinDiv(publicDesk, pickNum);
                createAndPutCoinDiv(myDesk, pickNum);
                removeHumanChoiceBtnsEventListener();
                judge(newGameStatus, playerList);
                if (!gameOver) {
                    setTimeout(
                        () => notifyNextPlayer(newGameStatus, playerList),
                        1000
                    );
                } else choiceField.innerHTML = "";
            }
        }
    }
}

function removeCoinDiv(targetDiv: HTMLElement, numToRemove: number): void {
    for (let i = 0; i < numToRemove; i++) {
        const movedCoin = targetDiv.childNodes[0];
        if (movedCoin instanceof HTMLElement) targetDiv.removeChild(movedCoin);
    }
}

function createAndPutCoinDiv(divToPut: HTMLElement, numToCreate: number): void {
    for (let i = 0; i < numToCreate; i++) {
        const coinDiv = document.createElement("div");
        coinDiv.className = "coin";
        divToPut.appendChild(coinDiv);
    }
}

function notifyNextPlayer(
    gameStatus: GameStatus,
    playerList: ("human" | MachinePlayer)[]
): void {
    if (gameStatus.nextPlayer instanceof MachinePlayer) {
        let newGameStatus = machinePlayerMakeMove(gameStatus);
        judge(newGameStatus, playerList);
        if (gameOver) choiceField.innerHTML = "";
        else addHumanChoiceBtnsEventListener(newGameStatus, playerList);
    } else addHumanChoiceBtnsEventListener(gameStatus, playerList);
}

function removeHumanChoiceBtnsEventListener(): void {
    const allChoiceBtns = document.getElementsByClassName("choice-btn");
    for (let eachBtn of allChoiceBtns) {
        eachBtn.replaceWith(eachBtn.cloneNode(true));
    }
}

function addHumanChoiceBtnsEventListener(
    gameStatus: GameStatus,
    playerList: ("human" | MachinePlayer)[]
): void {
    const allChoiceBtns = document.getElementsByClassName("choice-btn");
    for (let eachBtn of allChoiceBtns) {
        eachBtn.addEventListener("click", (e) => {
            humanMakeMove(e, gameStatus, playerList);
        });
    }
}

let computer1: MachinePlayer = new MachinePlayer(initialNumOfCoin, maxPickable);
let computer2: MachinePlayer = new RandomPlayer(initialNumOfCoin, maxPickable);
trainBtn.addEventListener("click", () => {
    trainBtn.disabled = true;
    // remove whatever event listener from trainBtn
    trainBtn.replaceWith(trainBtn.cloneNode(true));

    let batchTrainTime = 500;
    while (computer1.winTimes < batchTrainTime * 0.99) {
        computer1.winTimes = 0;
        computer2.winTimes = 0;
        train(batchTrainTime, [computer1, computer2]);
        printTrainResult([computer1, computer2]);
    }
    hintDiv.innerHTML = "Computer Trained!";
});
startBtn.addEventListener("click", () => humanStartPlay(["human", computer1]));
restartBtn.addEventListener("click", () => location.reload());
