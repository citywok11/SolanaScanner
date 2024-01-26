const axios = require('axios');

async function sendToDiscordWebhook(metadata) {
    const webhookUrl = 'https://discord.com/api/webhooks/1200200236128280667/QnwdnLkUpNPCwqe5ya_pCVOsdq_l5fnn1iK_KVzMraXTC4wzHgimdM-VfOwo5iGOUpjf';

    if(metadata.name && metadata.url && metadata.twitter)
    {

    console.log(metadata)
    const message = `Name: ${metadata.name}
    \nSymbol: ${metadata.symbol}
    \nURL: ${metadata.url}
    \nhttps://dexscreener.com/solana/${metadata.mintId}
    \nhttps://rugcheck.xyz/tokens/${metadata.mintId}
    \nTwitter: ${metadata.twitter}
    \n -----------------------------------------------------------------------------------\n`;

    try {
        await axios.post(webhookUrl, {
            content: message
        });
        console.log('Message sent to Discord successfully');
    } catch (error) {
        console.error('Error sending message to Discord:', error.message);
    }
}
}

module.exports = { sendToDiscordWebhook };