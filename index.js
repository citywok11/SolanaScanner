const express = require('express');
const { getTokenMetadata } = require('./metadata');
const { fetchData } = require('./fetchdata');
const { sendToDiscordWebhook } = require('./discordWebhook');
const { htmlScraper} = require('./htmlScraper');
const { performSwap} = require('./purchaseToken')
const Queue = require('bull');
const app = express();
app.use(express.json());
const bs58 = require('bs58');


// Set up the Bull queue
const mintIdQueue = new Queue('mintIdQueue', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Helper function to extract mint IDs from the request body
const extractMintIds = (body) => {
    const mintIds = new Set();
    if (!Array.isArray(body)) {
        throw new Error("Invalid input: req.body is not an array.");
    }

    body.forEach(item => {
        item.accountData?.forEach(accountDataItem => {
            accountDataItem.tokenBalanceChanges?.forEach(change => {
                if (change.mint && change.mint !== 'So11111111111111111111111111111111111111112') {
                    mintIds.add(change.mint);
                }
            });
        });
    });

    return mintIds;
};

// Function to process jobs in the queue
mintIdQueue.process(async (job) => {
    const mintId = job.data.mintId;
    try {
        const uri = await getTokenMetadata(mintId);
        if (!uri) {
            console.log(`No URI found for mintId: ${mintId}`);
            return;
        }

        const metaData = await fetchData(uri, mintId);
        if (metaData) {
            if(metaData.website) {

                const telegramInUrl = metaData.website.toLowerCase().includes("https://t.me")

                if(await htmlScraper(metaData.website, metaData.mintId) == true && metaData.twitter && !telegramInUrl && metaData.creator.name !== 'DEXLAB MINTING LAB')
                {
                    const maxLamports = 5000; // Maximum fee in lamports you're willing to pay
                    const amount = 0.1; // Amount of the token you are swapping (in smallest unit)
                    const jupMint = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
                    const solMint = 'So11111111111111111111111111111111111111112'
                    const RPC_URL = "https://api.mainnet-beta.solana.com"; // Example RPC URL
                    const WALLET_PRIVATE_KEY =  [152,54,90,131,160,119,2,163,149,232,153,15,217,168,9,222,223,195,238,220,73,114,40,49,189,78,215,148,30,63,112,86,48,67,219,159,95,122,80,184,132,230,85,78,55,39,139,240,4,201,147,128,176,26,229,45,50,185,60,120,3,11,205,163]; // Use your actual private key
                    // Convert the numeric array to a Uint8Array
                    const privateKeyUint8Array = new Uint8Array(WALLET_PRIVATE_KEY);

                    // Encode the Uint8Array to a Base58 string
                   const privateKeyBase58 = bs58.encode(privateKeyUint8Array);
                   
                    await performSwap(amount, maxLamports, metaData.mintId, solMint, RPC_URL, privateKeyBase58)
                    //await performSwap(raydiumSwap, amount, maxLamports, metaData.mintId, solMint, RPC_URL, privateKeyBase58)
                    //await performSwap(raydiumSwap, amount, maxLamports, metaData.mintId, solMint, RPC_URL, privateKeyBase58)

                    //const WALLET_PRIVATE_KEY_DAVE =  [68,50,7,236,83,11,20,4,88,83,208,9,183,17,220,130,11,30,239,107,121,93,219,63,48,204,110,224,87,100,54,26,45,251,169,77,69,66,143,175,242,20,47,208,250,42,76,164,141,208,118,79,96,251,59,126,193,90,24,122,67,48,253,90]; // Use your actual private key
                    // Convert the numeric array to a Uint8Array
                    //const privateKeyUint8ArrayDAVE = new Uint8Array(WALLET_PRIVATE_KEY_DAVE);

                    //const WALLET_PRIVATE_KEY_LIAM = [189,213,56,232,235,193,125,13,183,50,59,212,160,78,180,78,33,100,150,205,116,139,153,34,228,115,236,52,150,227,232,201,2,73,234,247,180,16,2,244,41,92,172,27,156,190,202,186,150,187,84,112,181,218,18,147,63,128,127,37,194,148,13,104]
                    //const privateKeyUint8ArrayLIAM = new Uint8Array(WALLET_PRIVATE_KEY_LIAM);

                  //  await performSwap(amount, maxLamports, metaData.mintId, solMint, RPC_URL, privateKeyUint8ArrayLIAM)
                  //  await performSwap(amount, maxLamports, metaData.mintId, solMint, RPC_URL, privateKeyUint8ArrayDAVE)


                    await sendToDiscordWebhook(metaData);
                }
            }
        } else {
            console.log(`No metadata found for mintId: ${mintId}`);
        }
    } catch (error) {
        console.error("Error fetching metadata for", mintId, ":", error);
    }
});

// Main route handler
app.post('/token_mint', async (req, res) => {
    try {
        const mintIds = extractMintIds(req.body);
        console.log("Unique Mint IDs:", [...mintIds]);

        // Adding mintIds to the queue
        mintIds.forEach(mintId => {
            mintIdQueue.add({ mintId });
        });

        res.status(200).send({ message: 'mintIds queued for processing' });
    } catch (error) {
        console.error("Error in /token_mint route:", error.message);
        res.status(400).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
