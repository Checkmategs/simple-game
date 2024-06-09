const TelegramBot = require('node-telegram-bot-api');
const token = '7058698160:AAEkvTx7AsC0wUUcVpitpxhfZwSxrSuqgac'; // Замените на токен вашего бота
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the game! Click the link below to start playing:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Play Game", url: "https://checkmategs.github.io/simple-game/" }] // Замените на ваш URL
            ]
        }
    });
});
