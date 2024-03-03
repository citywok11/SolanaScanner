const axios = require('axios');
require('./logger'); // This patches console.log

async function sendToDiscordWebhook(metadata, webhookUrl) {

    console.log("this has hit meta data" + metadata)
    let message = "\n\n\n\n -----------------------------------------------------------------------------------";

    if (metadata.name) {
        message += `\nName: ${metadata.name}`;
    }
    if (metadata.symbol) {
        message += `\nSymbol: ${metadata.symbol}`;
    }
    if (metadata.website) {
        message += `\nURL: ${metadata.website}`;
    }
    if (metadata.mintId) {
        message += `\nMintId: ${metadata.mintId}`;
        message += `\nhttps://dexscreener.com/solana/${metadata.mintId}`;
        message += `\nhttps://rugcheck.xyz/tokens/${metadata.mintId}`;
        message += `\nhttps://solscan.io/token/${metadata.mintId}`;
    }
    if (metadata.twitter) {
        message += `\nTwitter: ${metadata.twitter}`;
    }

    try {
        ("trying to post to discord")
        await axios.post(webhookUrl, {
            content: message
        });
        console.log('Message sent to Discord successfully');
    } catch (error) {
        console.error('Error sending message to Discord:', error.message);
    }
}

module.exports = { sendToDiscordWebhook };