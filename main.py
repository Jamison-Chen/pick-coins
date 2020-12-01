import machinePlayer as mp
import random
import time
numberOfCoin = 10
gameRunning = True
computer1 = mp.Player(row=10, column=3)
computer2 = mp.Player(row=10, column=3)
p1Win = 0
p2Win = 0
totalGames = 0
mover = 1
p1Start = 0
p2Start = 0


def newResult(pick=0, role="", p1=""):
    global numberOfCoin
    if role == "machine" and pick > numberOfCoin:
        # print("Insufficient coins.... " + str(numberOfCoin) + " left")
        return False
    numberOfCoin -= pick
    if p1 == "human":
        print("\t\t\t\t"+("● " * numberOfCoin))
    return True


def player1MakeMove(role="machine"):
    global computer1, numberOfCoin
    if role == "machine":
        player1_pick = computer1.makeMove(numberOfCoin)[0]
        # print("\nPlayer1 picks: " + str(player1_pick) + " coins")
        # print(computer1.table)
        sufficient = newResult(pick=player1_pick, role=role, p1=role)
        while not sufficient:
            player1_pick_again = computer1.receiveFeedback(-2)[0]
            # print("\nPlayer1 REpicks: " + str(player1_pick_again) + " coins")
            # print(computer1.table)
            sufficient = newResult(pick=player1_pick_again, role=role, p1=role)
    elif role == "human":
        isDigit = False
        while not isDigit:
            print("Please enter a number.")
            inP = input()
            if not inP.isdigit():
                continue
            isDigit = True
            player1_pick = int(inP)
            if player1_pick > min(3, numberOfCoin) or player1_pick < 1:
                print("You should pick 1~"+str(min(3, numberOfCoin))+" coin(s)")
                isDigit = False
        print("\nPlayer1 picks: " + str(player1_pick) + " coins")
        newResult(pick=player1_pick, role=role, p1=role)


def player2MakeMove(opponent=""):
    global computer2, numberOfCoin
    player2_pick = computer2.makeMove(numberOfCoin)[0]
    if opponent == "human":
        time.sleep(1)
        print("\n\t\t\t\t\t\t\t\t\tPlayer2 picks: " +
              str(player2_pick) + " coins")
    # print(computer2.table)
    sufficient = newResult(pick=player2_pick, role="machine", p1=opponent)
    while not sufficient:
        player2_pick_again = computer2.receiveFeedback(-2)[0]
        # print("\n\t\t\t\t\t\t\t\t\tPlayer2 REpicks: " +
        #       str(player2_pick_again) + " coins")
        # print(computer2.table)
        sufficient = newResult(pick=player2_pick_again,
                               role="machine", p1=opponent)


def judge(lastMover, p1="machine"):
    global computer1, computer2, p1Win, p2Win, totalGames, gameRunning, numberOfCoin, mover
    if numberOfCoin == 0:
        if p1 == "machine":
            if lastMover == 1:
                # print("Player2 wins!!!!!!\n\n")
                p2Win += 1
                computer1.receiveFeedback(-1)
                computer2.receiveFeedback(1)
            elif lastMover == 2:
                # print("Player1 wins!!!!!!\n\n")
                p1Win += 1
                computer1.receiveFeedback(1)
                computer2.receiveFeedback(-1)
            computer1.refreshPath()
            computer2.refreshPath()
            # print(computer1.table)
            # print(computer2.table)
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
            # print(computer2.table)
        gameRunning = False
        totalGames += 1
    mover = -1 * lastMover + 3  # input 2 -> output1; input 1 -> output 2


def newGame(p1):
    global numberOfCoin, gameRunning, mover, p1Start, p2Start
    gameRunning = True
    numberOfCoin = 10
    if p1 == "human":
        print("\t\t\t\t"+("● " * numberOfCoin))
    mover = random.randint(1, 2)
    if mover == 1:
        p1Start += 1
    else:
        p2Start += 1


def play(trainTimes, p1=""):
    global gameRunning, mover, totalGames
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


def train(trainTimes):
    play(trainTimes=trainTimes, p1="machine")


def printTrainResult():
    global p1Win, p2Win, totalGames, p1Start, p2Start
    print("Game start with P1: "+str(p1Start)+" / P2: "+str(p2Start))
    print("P1 winning rate: " + str(p1Win/totalGames*100) + "%")
    print("P2 winning rate: " + str(p2Win/totalGames*100) + "%")
    print(computer1.table)
    print(computer2.table)


train(1000)
printTrainResult()

totalGames = 0
play(trainTimes=1, p1="human")
