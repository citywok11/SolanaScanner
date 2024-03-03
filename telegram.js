const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with the token you received from BotFather
const token = '7192612907:AAG3FTcf6nGpmoHObhynT9iSGCXeWW5Jbmw';
const bot = new TelegramBot(token, {polling: true});

// Replace 'BONK_BOT_CHAT_ID' with the actual chat ID of the Bonk Bot chat
const bonkBotChatId = 'BONK_BOT_CHAT_ID';

// Function to forward messages to Bonk Bot
function sendMessageToBonkBot(message) {
    bot.sendMessage(bonkBotChatId, message).then(() => {
        console.log("Message forwarded to Bonk Bot");
    }).catch(error => {
        console.error("Failed to send message to Bonk Bot", error);
    });
}

// Example usage
sendMessageToBonkBot("Hello, Bonk Bot!");