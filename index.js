const { peformTransaction}  = require('./jupswap')
const express = require('express');
const { getTokenMetadata } = require('./metadata');
const { fetchData } = require('./fetchdata');
const { sendToDiscordWebhook } = require('./discordWebhook');
const { getPrice } = require('./getPoolData');
const { htmlScraper} = require('./htmlScraper');
const Queue = require('bull');
const app = express();
const { queryLpBaseTokenAmount } = require('./getPoolData')
app.use(express.json());
require('./logger'); // This patches console.log


const mintIdQueue = new Queue('mintIdQueue', process.env.REDIS_URL || 'redis://127.0.0.1:6379');



// Helper function to extract mint IDs from the request body
const extractMintIds = (body) => {
    const mintJson = {};
    if (!Array.isArray(body)) {
        throw new Error("Invalid input: req.body is not an array.");
    }
    body.forEach(item => {

        var referenceId;

        item.accountData?.forEach(accountDataItem => {
            accountDataItem.tokenBalanceChanges?.forEach(change => {
                //console.log(accountDataItem);
                if (change.mint && change.mint !== 'So11111111111111111111111111111111111111112') {
                    if(accountDataItem.nativeBalanceChange == '0') {
                    //mintIds.add(change.mint);
                    mintJson["mintId"] = change.mint
                    }
                }
                else 
                {
                    if(accountDataItem.nativeBalanceChange != '400000000')
                    {
                        referenceId = accountDataItem.account;
                        mintJson["vaultId"] = accountDataItem.account;
                        //console.log("reference is" + referenceId);
                    }
                }
            });
        });
    });

    return mintJson;
};


// Function to process jobs in the queue
mintIdQueue.process(async (job) => {
    console.log(job.data.mintJson);
    let mintId = job.data.mintJson.mintId;
    let vaultId = job.data.mintJson.vaultId

    try {
        const uri = await getTokenMetadata(mintId);
        if (!uri) {
            console.log(`No URI found for mintId: ${mintId}`);
            return;
        }

        console.log("uri is " + uri);

        const metaData = await fetchData(uri, mintId);
        if (metaData) {
            const webhookUrl = 'https://discord.com/api/webhooks/1200200236128280667/QnwdnLkUpNPCwqe5ya_pCVOsdq_l5fnn1iK_KVzMraXTC4wzHgimdM-VfOwo5iGOUpjf';
            //await queryLpBaseTokenAmount(metaData.mintId);
            if(metaData.website) {

                const telegramInUrl = metaData.website.toLowerCase().includes("https://t.me")



                //await peformTransaction(metaData.mintId)
               // await peformTransaction(mintId)
 


                if(await htmlScraper(metaData.website, metaData.mintId) == true && metaData.twitter && !telegramInUrl)
                {
                    await sendToDiscordWebhook(metaData, webhookUrl);
                    getPrice(vaultId, webhookUrl, metaData);
                }
            }
        } else {
            console.log(`No metadata found for mintId: ${mintId}`);
        }
    }  catch (error) {
        console.error("Error fetching metadata for", mintId, ":", error);
    }
});

// Main route handler
app.post('/token_mint', async (req, res) => {
    try {
        //let now = new Date();
        //console.log(now);
        const mintJson = extractMintIds(req.body);

        //console.log(mintJson)

        mintIdQueue.add({ mintJson });

        res.status(200).send({ message: 'mintIds queued for processing' });
    } catch (error) {
        console.error("Error in /token_mint route:", error.message);
        res.status(400).send({ error: error.message });
    }
});

function findSpecificAccounts(data) {
    const targetMint = 'So11111111111111111111111111111111111111112';
    const excludeNativeBalanceChange = 400000000;

    // Filter the data based on the criteria
    const filteredAccounts = data.filter(entry => 
        entry.nativeBalanceChange !== excludeNativeBalanceChange &&
        entry.tokenBalanceChanges.some(change => 
            change.mint === targetMint
        )
    );

    // Extract the account numbers from the filtered entries
    const accountNumbers = filteredAccounts.map(entry => entry.account);

    return accountNumbers;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
