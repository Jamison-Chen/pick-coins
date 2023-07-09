import random
import time
from typing import Literal

from machinePlayer import Player

numberOfCoin = 10
gameRunning = True
computer1 = Player(row=10, column=3)
computer2 = Player(row=10, column=3)
p1Win = 0
p2Win = 0
totalGames = 0
mover = 1
p1Start = 0
p2Start = 0

ROLE = Literal["human", "machine"]


def newResult(pick: int, role: ROLE, p1: ROLE) -> bool:
    global numberOfCoin
    if role == "machine" and pick > numberOfCoin:
        return False
    numberOfCoin -= pick
    if p1 == "human":
        print("\t\t\t\t" + ("● " * numberOfCoin))
    return True


def player1MakeMove(role: ROLE = "machine") -> None:
    global computer1, numberOfCoin
    if role == "machine":
        player1_pick = computer1.makeMove(numberOfCoin)[0]
        sufficient = newResult(pick=player1_pick, role=role, p1=role)
        while not sufficient:
            computer1.receiveFeedback(-2)
            player1_pick = computer1.makeMove(numberOfCoin)[0]
            sufficient = newResult(pick=player1_pick, role=role, p1=role)
    elif role == "human":
        player1_pick = None
        while player1_pick is None:
            print("Please enter a number.")
            input_str = input()
            if not input_str.isdigit():
                continue
            player1_pick = int(input_str)
            if player1_pick > min(3, numberOfCoin) or player1_pick < 1:
                print(f"You should pick 1~{str(min(3, numberOfCoin))} coin(s)")
                player1_pick = None
        print(f"\nPlayer1 picks: {str(player1_pick)} coins")
        newResult(pick=player1_pick, role=role, p1=role)


def player2MakeMove(opponent: ROLE) -> None:
    global computer2, numberOfCoin
    player2_pick = computer2.makeMove(numberOfCoin)[0]
    if opponent == "human":
        time.sleep(1)
        print("\n\t\t\t\t\t\t\t\t\tPlayer2 picks: " + str(player2_pick) + " coins")
    sufficient = newResult(pick=player2_pick, role="machine", p1=opponent)
    while not sufficient:
        computer2.receiveFeedback(-2)
        player2_pick = computer2.makeMove(numberOfCoin)[0]
        sufficient = newResult(pick=player2_pick, role="machine", p1=opponent)


def judge(lastMover, p1: ROLE = "machine") -> None:
    global computer1, computer2, p1Win, p2Win, totalGames, gameRunning, numberOfCoin, mover
    if numberOfCoin == 0:
        if p1 == "machine":
            if lastMover == 1:
                p2Win += 1
                computer1.receiveFeedback(-1)
                computer2.receiveFeedback(1)
            elif lastMover == 2:
                p1Win += 1
                computer1.receiveFeedback(1)
                computer2.receiveFeedback(-1)
            computer1.refreshPath()
            computer2.refreshPath()
        elif p1 == "human":
            if lastMover == 1:
                print("Player2 wins!!!!!!\n\n")
                p2Win += 1
                computer2.receiveFeedback(1)
            elif lastMover == 2:
                print("Player1 wins!!!!!!\n\n")
                p1Win += 1
                computer2.receiveFeedback(-1)
            computer2.refreshPath()
        gameRunning = False
        totalGames += 1
    mover = -1 * lastMover + 3  # input 2 -> output1; input 1 -> output 2


def newGame(p1: ROLE) -> None:
    global numberOfCoin, gameRunning, mover, p1Start, p2Start
    gameRunning = True
    numberOfCoin = 10
    if p1 == "human":
        print("\t\t\t\t" + ("● " * numberOfCoin))
    mover = random.randint(1, 2)
    if mover == 1:
        p1Start += 1
    else:
        p2Start += 1


def play(trainTimes: int, p1: ROLE) -> None:
    global gameRunning, mover, totalGames
    totalGames = 0
    newGame(p1=p1)
    while gameRunning:
        if mover == 1:
            player1MakeMove(role=p1)
            judge(lastMover=mover, p1=p1)
            if totalGames == trainTimes:
                return
            if not gameRunning:
                newGame(p1=p1)
                if mover == 1:
                    continue
        player2MakeMove(opponent=p1)
        judge(lastMover=mover, p1=p1)
        if totalGames == trainTimes:
            return
        if not gameRunning:
            newGame(p1=p1)


def train(trainTimes: int) -> None:
    play(trainTimes=trainTimes, p1="machine")


def printTrainResult() -> None:
    global p1Win, p2Win, totalGames, p1Start, p2Start
    print("Game start with P1: " + str(p1Start) + " / P2: " + str(p2Start))
    print("P1 winning rate: " + str(p1Win / totalGames * 100) + "%")
    print("P2 winning rate: " + str(p2Win / totalGames * 100) + "%")
    print(computer1.table)
    print(computer2.table)


if __name__ == "__main__":
    train(1000)
    printTrainResult()
    play(trainTimes=1, p1="human")
