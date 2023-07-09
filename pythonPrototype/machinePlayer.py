import random
from typing import Literal

import numpy as np


class Player:
    def __init__(self, row, column) -> None:
        self.table = np.zeros((row, column))
        self.path: list[list[int]] = []  # [[rest coin(s), take number], ...]
        self.learningRate = 0.5
        self.discountRate = 0.5

    def refreshPath(self) -> None:  # Refresh path only if the game is over.
        self.path.clear()

    def pathAppend(self, theRestCoin: int, take_i: int) -> None:
        self.path.append([theRestCoin, take_i])

    # Receive feedback either if the game is over or if insufficient coins to pick.
    def receiveFeedback(self, winOrLose: Literal[1, -1, -2]) -> None:
        if winOrLose == 1:
            self.table[self.path[-1][0] - 1][self.path[-1][1] - 1] += 10
        elif winOrLose == -1:
            self.table[self.path[-1][0] - 1][self.path[-1][1] - 1] -= 10
        elif winOrLose == -2:  # receive this if an invalid move has been made
            lastPlace = self.path[-1][0]
            # a deduction(reverse) of the values that last invalid move added.
            self.givePoints(theRestCoin=lastPlace, reverse=True)
            self.table[lastPlace - 1][self.path[-1][1] - 1] -= float("inf")
            self.path.pop()

    ##############################################################################
    # Key Logic Here!
    def givePoints(self, theRestCoin: int, reverse: bool = False) -> None:
        def calculatePoint(theRestCoin: int, take_i: int) -> float:
            zero = np.array([0, 0, 0])
            restCoinAfterYouTakeI = theRestCoin - take_i
            # If your opponent then take 1, the next time you will have restCoinAfterYouTakeI-1 conis rest.
            # If your opponent then take 2, the next time you will have restCoinAfterYouTakeI-2 conis rest.
            # If your opponent then take n, the next time you will have restCoinAfterYouTakeI-n conis rest.
            if (restCoinAfterYouTakeI - 1) - 1 >= 0:
                target = self.table[(restCoinAfterYouTakeI - 1) - 1 :: -1][:]
                target = target[:3]
                # If there exists any row that all numbers are negative,
                # it means that "take i" now will lead you to failure
                # because your opponent is smart enough to push you to that situation.
                for each in target:
                    if (each < zero).all():
                        return each.max() * self.discountRate

                # If there exists any row that all numbers are zero
                # (and no row is all-negative) it means that this choice
                # will lead you to an unknown result.
                for each in target:
                    if (each == zero).all():
                        return 0

                return target.max() * self.discountRate
            else:
                return 0

        plusOrMinus = -1 if reverse else 1
        for i in range(1, 4):
            if i <= theRestCoin:
                # Q <- Q + lr*point
                self.table[theRestCoin - 1][i - 1] += (
                    self.learningRate
                    * calculatePoint(theRestCoin=theRestCoin, take_i=i)
                    * plusOrMinus
                )

    ###############################################################################

    def makeMove(self, theRestCoin: int) -> list[int]:
        # If you made an invalid move, and has been notified by the judge,
        # a deduction of the values in each blank is needed.
        # However, if the max number of coins you can pick < 4,
        # the situation described above can actually be ignored.
        self.givePoints(theRestCoin)
        max_val = self.table[theRestCoin - 1][0]
        take_i = 0
        thisRow = self.table[theRestCoin - 1][:]
        if np.all(thisRow == thisRow[0]) and thisRow[0] == 0:
            # print(thisRow)
            take_i = random.randint(1, 3)
            # take_i = random.randint(1,min(3,theRestCoin))
        else:
            for i in range(1, 4):
                if thisRow[i - 1] >= max_val:
                    max_val = thisRow[i - 1]
                    take_i = i
        self.pathAppend(theRestCoin=theRestCoin, take_i=take_i)
        return [take_i, max_val]
