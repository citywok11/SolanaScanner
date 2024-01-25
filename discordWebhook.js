const axios = require('axios');

async function sendToDiscordWebhook(metadata) {
    const webhookUrl = 'https://discord.com/api/webhooks/1200200236128280667/QnwdnLkUpNPCwqe5ya_pCVOsdq_l5fnn1iK_KVzMraXTC4wzHgimdM-VfOwo5iGOUpjf';

    // Construct the message
    const message = `Name: ${metadata.name}\nSymbol: ${metadata.symbol}\nTwitter: ${metadata.twitter}\nURL: ${metadata.url}\nMint ID: ${metadata.mintId}\n`;

    try {
        await axios.post(webhookUrl, {
            content: message
        });
        console.log('Message sent to Discord successfully');
    } catch (error) {
        console.error('Error sending message to Discord:', error.message);
    }
}

module.exports = { sendToDiscordWebhook };