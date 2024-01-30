const express = require('express');
const { getTokenMetadata } = require('./metadata');
const { fetchData } = require('./fetchdata');
const { sendToDiscordWebhook } = require('./discordWebhook');
const Queue = require('bull');
const app = express();
app.use(express.json());

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
            await sendToDiscordWebhook(metaData);
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
