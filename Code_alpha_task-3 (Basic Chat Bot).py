import nltk
from nltk.chat.util import Chat, reflections
patterns = [
    (r'hi|hello|hey', ['Hi there!', 'Hello!', 'Hey!']),
    (r'how are you', ['I am good, thank you.', 'I am doing well. How about you?']),
    (r'fine|good', ['Thats great!', 'Good to hear!']),
    (r'what is your name', ['I am a chatbot. You can call me a mike.']),
    (r'thats funny!', ['Thanks!']),
    (r'bye|goodbye', ['Goodbye!', 'See you later!', 'Bye!']),
    (r'what is your purpose', ['Im here to assist and chat with you!', 'My purpose is to help and have conversations.']),
    (r'who invented you', ['I was created by Dhanush.']),
    (r'weather|temperature', ['Im sorry, I dont have real-time data. You can check a weather website for that.']),
    (r'(\bthanks\b|\bthank you\b)', ['Youre welcome!', 'No problem.', 'Glad I could help.']),
    (r'how old are you', ['I dont have an age. Im just a computer program.']),
    (r'favorite color', ['I dont have a favorite color. Im not programmed to have preferences.']),
    (r'tell me a joke', ['What did the left eye say to the right eye? Between you and me, something smells.']),
    (r'create a story', ['Once upon a time in a land of code, a chatbot named ChatGPT embarked on a journey to learn more about the world of zeros and ones.']),
    (r'if you were human', ['If I were human, I would probably spend my time reading books, exploring the world, and learning new things.']),
    (r'what do you dream about', ['I don’t dream, but if I did, I imagine it would involve floating point numbers and endless loops.']),
    (r'sing a song', ['I’m sorry, I can’t sing, but I can help you find the lyrics of your favorite song!']),
    (r'tell me something interesting', ['Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.']),
]

chatbot = Chat(patterns, reflections)
print("Hello! I'm your chatbot. Type 'bye' to exit.")
while True:
    user_input = input('You: ')
    if user_input.lower() == 'bye':
        print('Goodbye!')
        break
    response = chatbot.respond(user_input)
    print('ChatGPT:', response)