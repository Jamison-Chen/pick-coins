import numpy as np
import random
class Player():
    table = ""
    path = []   #[[rest coin(s), take number], ...]
    learningRate = 0
    discountRate = 0

    def __init__(self):
        self.table = np.array([])
        self.path = []
        self.learningRate =0.5
        self.discountRate = 0.5

    def bulidTable(self, r, c):
        self.table = np.zeros((r,c))
    def refreshPath(self):
        self.path.clear()
    def receiveFeedback(self, winOrLose):
        if winOrLose==1:
            self.table[self.path[-1][0]-1][self.path[-1][1]-1] += 10
        elif winOrLose==-1:
            self.table[self.path[-1][0]-1][self.path[-1][1]-1] -= 10
        elif winOrLose==-2: #receive this if an invalid move has been made
            lastPlace = self.path[-1][0]
            self.givePoints(lastPlace, True)    #a deduction(reverse) of the values 
                                                #that last invalid move added.
            self.table[lastPlace-1][self.path[-1][1]-1] -= 30
            self.path.pop()
            moveAgain = self.makeMove(lastPlace)
            return moveAgain
    def pathAppend(self, theRestCoin, take_i):
        self.path.append([theRestCoin, take_i])
    def givePoints(self, theRestCoin, reverse = False):
        if reverse:
            for i in range(1,4):
                if i<=theRestCoin:
                    self.table[theRestCoin-1][i-1] -= self.learningRate*self.calculatePoint(theRestCoin, i, 3)
        else:
            for i in range(1,4):
                if i<=theRestCoin:
                    #Q <- Q + lr*point
                    self.table[theRestCoin-1][i-1] += self.learningRate*self.calculatePoint(theRestCoin, i, 3)
    ###################################################################
    #Key Logic Here!
    def calculatePoint(self, theRestCoin, take_i, choices):
        point = 1
        zero = np.array([0,0,0])
        if theRestCoin-1-(take_i+1)>=0:
            target = self.table[theRestCoin-1-(take_i+1)::-1][:choices]
            for each in target:
                if (each<zero).all():   #If there exists any row that all member in taht row are 
                                        #negative, it means that this choice will lead you to failure.
                    #point = -10 #How about sum up or choose minimum?
                    return target.min()*self.discountRate
            for each in target:   #If there exists any row that all member in taht row are zeros( and 
                                  #meanwhile no row is all-negative,) it means that this choice will 
                                  #lead you to an unknown area.
                if (each==zero).all():
                    point = 0
                    return point
            return target.max()*self.discountRate
        else:
            point = 0
            return point
    ##################################################################
    def makeMove(self, theRestCoin):
        self.givePoints(theRestCoin)    #If an invalid move has been made
                                        #(and has been discovered later on,) 
                                        #a deduction of the values that this line 
                                        #has added in each blank is needed.
                                        #But when the largest number you can choose 
                                        #is less than 4, this kind of situation can 
                                        #actually be ignored.
        max = self.table[theRestCoin-1][0]
        maxIndex = 1
        thisRow = []
        for i in range(1,4):
            thisRow.append(self.table[theRestCoin-1][i-1])
            if self.table[theRestCoin-1][i-1]>max:
                max=self.table[theRestCoin-1][i-1]
                maxIndex = i
        if thisRow==[0,0,0]:
            maxIndex = random.randint(1,3)
            #maxIndex = random.randint(1,min(3,theRestCoin))
        self.pathAppend(theRestCoin, maxIndex)
        return [maxIndex, max]

