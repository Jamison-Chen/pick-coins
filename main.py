import machinePlayer as mp
import random
import time
numberOfCoin = 10
gameRunning = True
computer1 = mp.Player()
computer1.bulidTable(10,3)
computer2 = mp.Player()
computer2.bulidTable(10,3)
occassionalFeedBack = 0
p1Win = 0
p2Win = 0
totalGames = 0
mover = 1
p1Start = 0
p2Start = 0
def newResult(pick = 0):
    global numberOfCoin, occassionalFeedBack
    occassionalFeedBack = 0
    if pick<=numberOfCoin:
        numberOfCoin -= pick
        print("\t\t\t\t"+("● " * numberOfCoin))
    else:
        print("Insufficient coins.... " + str(numberOfCoin) + " left")
        occassionalFeedBack = -2
def player1MakeMove(human = ""):
    global computer1, computer2, p2Win, totalGames, gameRunning, numberOfCoin
    if human=="":
        player1_pick = computer1.makeMove(numberOfCoin)[0]
        print("\nPlayer1 picks: " + str(player1_pick) + " coins")
        #print(computer1.table)
        newResult(player1_pick)
        while occassionalFeedBack==-2:
            player1_pick_again = computer1.receiveFeedback(occassionalFeedBack)[0]
            print("\nPlayer1 REpicks: " + str(player1_pick_again) + " coins")
            #print(computer1.table)
            newResult(player1_pick_again)
    elif human=="human":
        isDigit = False
        while not isDigit:
            print("Please enter a number.")
            inP = input()
            if not inP.isdigit():
                continue
            isDigit = True
            player1_pick = int(inP)
            if player1_pick>min(3,numberOfCoin) or player1_pick<1:
                print("You should pick 1~"+str(min(3,numberOfCoin))+" coin(s)")
                isDigit = False
        print("\nPlayer1 picks: " + str(player1_pick) + " coins")
        newResult(player1_pick)
def player2MakeMove(human = ""):
    global computer1, computer2, p2Win, totalGames, gameRunning, numberOfCoin
    if human == "human":
        time.sleep(1)
    player2_pick = computer2.makeMove(numberOfCoin)[0]
    print("\n\t\t\t\t\t\t\t\t\tPlayer2 picks: " + str(player2_pick) + " coins")
    #print(computer2.table)
    newResult(player2_pick)
    while occassionalFeedBack==-2:
        player2_pick_again = computer2.receiveFeedback(occassionalFeedBack)[0]
        print("\n\t\t\t\t\t\t\t\t\tPlayer2 REpicks: " + str(player2_pick_again) + " coins")
        #print(computer2.table)
        newResult(player2_pick_again)
def judge(lastMover, human = ""):
    global computer1, computer2, p1Win, p2Win, totalGames, gameRunning, numberOfCoin, mover
    if numberOfCoin==0:
        if human == "":
            if lastMover == 1:
                print("Player2 wins!!!!!!\n\n")
                p2Win+=1
                computer1.receiveFeedback(-1)
                computer2.receiveFeedback(1)
            elif lastMover == 2:
                print("Player1 wins!!!!!!\n\n")
                p1Win+=1
                computer1.receiveFeedback(1)
                computer2.receiveFeedback(-1)
            computer1.refreshPath()
            computer2.refreshPath()
            #print(computer1.table)
            #print(computer2.table)
        elif human=="human":
            if lastMover == 1:
                print("Player2 wins!!!!!!\n\n")
                p2Win+=1
                computer2.receiveFeedback(1)
            elif lastMover == 2:
                print("Player1 wins!!!!!!\n\n")
                p1Win+=1
                computer2.receiveFeedback(-1)
            computer2.refreshPath()
            #print(computer2.table)
        gameRunning = False
        totalGames+=1
    mover = -1*lastMover+3  #input 2, output1; input 1, output 2
def newGame():
    global numberOfCoin, gameRunning, mover, p1Start, p2Start
    gameRunning = True
    numberOfCoin = 10
    print("\t\t\t\t"+("● " * numberOfCoin))
    mover = random.randint(1,2)
    if mover==1:
        p1Start+=1
    elif mover==2:
        p2Start+=1
def play(trainTimes, p1 = ""):
    global gameRunning, mover, totalGames
    newGame()
    while gameRunning:
        if mover==1:
            player1MakeMove(p1)
            judge(mover, p1)
            if totalGames==trainTimes:
                break
            if not gameRunning:
                newGame()
                if mover==1:
                    continue
        player2MakeMove(p1)
        judge(mover, p1)
        if totalGames==trainTimes:
            break
        if not gameRunning:
            newGame()
def train(trainTimes):
    play(trainTimes)
def printTrainResult():
    global p1Win, p2Win, totalGames, p1Start, p2Start
    print("Game start with P1: "+str(p1Start)+" / P2: "+str(p2Start))
    print("P1 winning rate: " + str(p1Win/totalGames*100) + "%")
    print("P2 winning rate: " + str(p2Win/totalGames*100) + "%")
def stealBetterTable():
    global p1Win, p2Win, totalGames, computer1, computer2
    #print(computer1.table)
    #print(computer2.table)
    if p1Win/totalGames*100>p2Win/totalGames*100:
        computer2.table = computer1.table

train(50)
printTrainResult()
stealBetterTable()

totalGames = 0
play(1, "human")
