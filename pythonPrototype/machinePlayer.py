import random
from typing import Literal

import numpy as np


class Player:
    def __init__(self, initial_coins: int, max_num_to_take: int) -> None:
        self.__initial_coins = initial_coins
        self.__max_num_to_take = max_num_to_take
        self.table = np.zeros((self.__initial_coins, self.__max_num_to_take))
        self.__path: list[tuple[int, int]] = []  # [(rest coin(s), take number), ...]
        self.__learnint_rate = 0.5
        self.__discount_rate = 0.5

    def refresh_path(self) -> None:  # Refresh when game is over.
        self.__path.clear()

    # Receive feedback either when the game is over or when invalid move made.
    def receive_feedback(self, feedback: Literal[1, -1, -2]) -> None:
        if feedback == 1:  # win
            self.table[self.__path[-1][0] - 1][self.__path[-1][1] - 1] += 10
        elif feedback == -1:  # lose
            self.table[self.__path[-1][0] - 1][self.__path[-1][1] - 1] -= 10
        elif feedback == -2:  # invalid move made
            prev_state, prev_num_took = self.__path.pop()
            # Revert the values that last invalid move added.
            self.__update_table(current_coin=prev_state, reverse=True)
            self.table[prev_state - 1][prev_num_took - 1] -= float("inf")

    def __update_table(self, current_coin: int, reverse: bool = False) -> None:
        def get_score(take: int) -> float:
            coin_you_left = current_coin - take
            if coin_you_left in (0, 1):
                return 0.0
            elif coin_you_left > 1:
                max_coin_your_opponent_left = coin_you_left - 1
                next_possible_states_for_you = self.table[
                    (max_coin_your_opponent_left - 1) :: -1, ::
                ][: self.__max_num_to_take]

                # Your opponent is always smart enough to push you to the worst
                # or the most uncertain situation!
                max_score_of_each_row = np.max(next_possible_states_for_you, axis=1)
                return np.min(max_score_of_each_row) * self.__discount_rate
            else:
                raise ValueError

        for i in range(1, min(self.__max_num_to_take, current_coin) + 1):
            # Q <- Q + lr * score
            self.table[current_coin - 1][i - 1] += (
                self.__learnint_rate * get_score(i) * (-1 if reverse else 1)
            )

    def makeMove(self, current_coin: int) -> int:
        self.__update_table(current_coin)
        current_row: np.ndarray = self.table[current_coin - 1]
        if np.all(current_row == 0):
            take = random.randint(1, self.__max_num_to_take)
        else:
            take = int(np.argmax(current_row)) + 1
        self.__path.append((current_coin, take))
        return take


if __name__ == "__main__":
    ...
