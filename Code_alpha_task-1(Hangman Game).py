import random
ICC_Cricket_World_Cup_2023_Teams = ["india","southafrica","australia","newzealand","pakistan","afghanistan","england","bangladesh","srilanka","netherlands"]
def choose_random_word():
    return random.choice(ICC_Cricket_World_Cup_2023_Teams)
def display_word(word, guessed_letters):
    display = ""
    for letter in word:
        if letter in guessed_letters:
            display += letter
        else:
            display += "_"
    return display
def play_hangman():
    odi_world_cup_team = choose_random_word()
    guessed_letters = []
    attempts = 6
    print("Welcome to Hangman!")
    while True:
        print("\nWord: " + display_word(odi_world_cup_team, guessed_letters))
        print("Attempts left: " + str(attempts))
        guess = input("Guess a letter: ").lower()
        if len(guess) != 1 or not guess.isalpha():
            print("Please enter a single letter.")
            continue
        if guess in guessed_letters:
            print("You've already guessed that letter.")
            continue
        guessed_letters.append(guess)
        if guess not in odi_world_cup_team:
            attempts -= 1
            print("Incorrect guess!")
        if "_" not in display_word(odi_world_cup_team, guessed_letters):
            print("\nCongratulations! You've guessed the cricket team: " + odi_world_cup_team)
            break
        if attempts == 0:
            print("\nGame over! The cricket team is: " + odi_world_cup_team)
            break
if __name__ == "__main__":
    play_hangman()
