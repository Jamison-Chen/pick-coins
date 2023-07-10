import random
import time
from typing import Literal

from ml_player import MLPlayer

num_of_coins = 10
is_game_running = True
computer1 = MLPlayer(10, 3)
computer2 = MLPlayer(10, 3)
p1_win = 0
p2_win = 0
total_games = 0
mover = 1
p1_start = 0
p2_start = 0

ROLE = Literal["human", "machine"]


def new_result(pick: int, role: ROLE, p1: ROLE) -> bool:
    global num_of_coins
    if role == "machine" and pick > num_of_coins:
        return False
    num_of_coins -= pick
    if p1 == "human":
        print("\t\t\t\t" + ("● " * num_of_coins))
    return True


def p1_make_move(role: ROLE = "machine") -> None:
    global computer1, num_of_coins
    if role == "machine":
        player1_pick = computer1.make_move(num_of_coins)
        sufficient = new_result(pick=player1_pick, role=role, p1=role)
        while not sufficient:
            computer1.receive_feedback(float("-inf"))
            player1_pick = computer1.make_move(num_of_coins)
            sufficient = new_result(pick=player1_pick, role=role, p1=role)
    elif role == "human":
        player1_pick = None
        while player1_pick is None:
            print("Please enter a number.")
            input_str = input()
            if not input_str.isdigit():
                continue
            player1_pick = int(input_str)
            if player1_pick > min(3, num_of_coins) or player1_pick < 1:
                print(f"You should pick 1~{str(min(3, num_of_coins))} coin(s)")
                player1_pick = None
        print(f"\nPlayer1 picks: {str(player1_pick)} coins")
        new_result(pick=player1_pick, role=role, p1=role)


def p2_make_move(opponent: ROLE) -> None:
    global computer2, num_of_coins
    player2_pick = computer2.make_move(num_of_coins)
    if opponent == "human":
        time.sleep(1)
        print("\n\t\t\t\t\t\t\t\t\tPlayer2 picks: " + str(player2_pick) + " coins")
    sufficient = new_result(pick=player2_pick, role="machine", p1=opponent)
    while not sufficient:
        computer2.receive_feedback(float("-inf"))
        player2_pick = computer2.make_move(num_of_coins)
        sufficient = new_result(pick=player2_pick, role="machine", p1=opponent)


def judge(last_mover, p1: ROLE = "machine") -> None:
    global computer1, computer2, p1_win, p2_win, total_games, is_game_running, num_of_coins, mover
    if num_of_coins == 0:
        if p1 == "machine":
            if last_mover == 1:
                p2_win += 1
                computer1.receive_feedback(-10)
                computer2.receive_feedback(10)
            elif last_mover == 2:
                p1_win += 1
                computer1.receive_feedback(10)
                computer2.receive_feedback(-10)
            computer1.refresh_path()
            computer2.refresh_path()
        elif p1 == "human":
            if last_mover == 1:
                print("Player2 wins!!!!!!\n\n")
                p2_win += 1
                computer2.receive_feedback(10)
            elif last_mover == 2:
                print("Player1 wins!!!!!!\n\n")
                p1_win += 1
                computer2.receive_feedback(-10)
            computer2.refresh_path()
        is_game_running = False
        total_games += 1
    mover = -1 * last_mover + 3  # input 2 -> output1; input 1 -> output 2


def new_game(p1: ROLE) -> None:
    global num_of_coins, is_game_running, mover, p1_start, p2_start
    is_game_running = True
    num_of_coins = 10
    if p1 == "human":
        print("\t\t\t\t" + ("● " * num_of_coins))
    mover = random.randint(1, 2)
    if mover == 1:
        p1_start += 1
    else:
        p2_start += 1


def play(train_times: int, p1: ROLE) -> None:
    global is_game_running, mover, total_games
    total_games = 0
    new_game(p1=p1)
    while is_game_running:
        if mover == 1:
            p1_make_move(role=p1)
            judge(last_mover=mover, p1=p1)
            if total_games == train_times:
                return
            if not is_game_running:
                new_game(p1=p1)
                if mover == 1:
                    continue
        p2_make_move(opponent=p1)
        judge(last_mover=mover, p1=p1)
        if total_games == train_times:
            return
        if not is_game_running:
            new_game(p1=p1)


def train(train_times: int) -> None:
    play(train_times=train_times, p1="machine")


def print_train_result() -> None:
    global p1_win, p2_win, total_games, p1_start, p2_start
    print("Game start with P1: " + str(p1_start) + " / P2: " + str(p2_start))
    print("P1 winning rate: " + str(p1_win / total_games * 100) + "%")
    print("P2 winning rate: " + str(p2_win / total_games * 100) + "%")
    print(computer1.table)
    print(computer2.table)


if __name__ == "__main__":
    train(1000)
    print_train_result()
    play(train_times=1, p1="human")
