import numpy as np
import random


class Player():

    def __init__(self, row, column):
        self.table = np.zeros((row, column))
        self.path = []  # [[rest coin(s), take number], ...]
        self.learningRate = 0.5
        self.discountRate = 0.5

    def refreshPath(self):  # Refresh path only if the game is over.
        self.path.clear()

    def pathAppend(self, theRestCoin, take_i):
        self.path.append([theRestCoin, take_i])

    # Receive feedback either if the game is over or if insufficient coins to pick.
    def receiveFeedback(self, winOrLose):
        if winOrLose == 1:
            self.table[self.path[-1][0]-1][self.path[-1][1]-1] += 10
        elif winOrLose == -1:
            self.table[self.path[-1][0]-1][self.path[-1][1]-1] -= 10
        elif winOrLose == -2:  # receive this if an invalid move has been made
            lastPlace = self.path[-1][0]
            # a deduction(reverse) of the values that last invalid move added.
            self.givePoints(theRestCoin=lastPlace, reverse=True)
            self.table[lastPlace-1][self.path[-1][1]-1] -= float("inf")
            self.path.pop()
            return self.makeMove(lastPlace)

    ####################################################################################
    # Key Logic Here!
    def givePoints(self, theRestCoin, reverse=False):
        def calculatePoint(theRestCoin, take_i, choices):
            point = 1
            zero = np.array([0, 0, 0])
            if theRestCoin-1-(take_i+1) >= 0:
                target = self.table[theRestCoin-1-(take_i+1)::-1][:choices]
                for each in target:
                    # If there exists any row that all member in taht row are negative,
                    # it means that this choice will lead you to failure.
                    if (each < zero).all():
                        # point = -10   # How about sum up or choose minimum?
                        return target.min()*self.discountRate

                # If there exists any row that all member in taht row are zeros
                # (and meanwhile no row is all-negative,) it means that this choice
                # will lead you to an unknown area.
                for each in target:
                    if (each == zero).all():
                        point = 0
                        return point
                return target.max()*self.discountRate
            else:
                point = 0
                return point
        plusOrMinus = -1 if reverse else 1
        for i in range(1, 4):
            if i <= theRestCoin:
                # Q <- Q + lr*point
                self.table[theRestCoin-1][i-1] += self.learningRate * calculatePoint(
                    theRestCoin=theRestCoin, take_i=i, choices=3) * plusOrMinus
    ##################################################################################

    def makeMove(self, theRestCoin):
        # If an invalid move has been made (and has been discovered later on,)
        # a deduction of the values in each blank is needed.
        # But when the largest number you can choose is less than 4,
        # this kind of situation can actually be ignored.
        self.givePoints(theRestCoin)
        max_val = self.table[theRestCoin-1][0]
        take_i = 1
        thisRow = self.table[theRestCoin-1][:]
        if np.all(thisRow == thisRow[0]) and thisRow[0] == 0:
            # print(thisRow)
            take_i = random.randint(1, 3)
            # take_i = random.randint(1,min(3,theRestCoin))
        else:
            for i in range(1, 4):
                if thisRow[i-1] > max_val:
                    max_val = thisRow[i-1]
                    take_i = i
        self.pathAppend(theRestCoin=theRestCoin, take_i=take_i)
        return [take_i, max_val]
