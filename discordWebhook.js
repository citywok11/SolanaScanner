const axios = require('axios');
require('./logger'); // This patches console.log
const { getPrice } = require('./getPoolData');
const { insertDataIntoMongoDB, insertDataIntoMongoDBForMetadata } = require('./postToMongo');


async function sendToDiscordWebhook(metaData, webhookUrl, vaultId, shitCoinMetaDataId) {

    var mongoId;
    console.log("this has hit meta data" + metaData)
    let message = "\n\n\n\n -----------------------------------------------------------------------------------";

    if (metaData.name) {
        message += `\nName: ${metaData.name}`;
    }
    if (metaData.symbol) {
        message += `\nSymbol: ${metaData.symbol}`;
    }
    if (metaData.website) {
        message += `\nURL: ${metaData.website}`;
    }
    if (metaData.mintId) {
        message += `\nMintId: ${metaData.mintId}`;
        message += `\nhttps://dexscreener.com/solana/${metaData.mintId}`;
        message += `\nhttps://rugcheck.xyz/tokens/${metaData.mintId}`;
        message += `\nhttps://solscan.io/token/${metaData.mintId}`;
    }
    if (metaData.twitter) {
        message += `\nTwitter: ${metaData.twitter}`;
    }

   /* try {
        await axios.post(webhookUrl, {
            content: message
        });

        console.log("posted to discord");

        console.log('Message sent to Discord successfully');
    } catch (error) {
        console.error('Error sending message to Discord:', error.message);
    }
    finally { */

        try {
        }
        catch (error) {
            console.log("Failed to send to ShitCoins mongo error:" + error);
        }
        finally {
            await getPrice(vaultId, webhookUrl, metaData, shitCoinMetaDataId, 'ShitCoinDb', 'ShitCoinHistoricalData');
        }
  //  }
}

module.exports = { sendToDiscordWebhook };