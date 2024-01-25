const { getTokenMetadata } = require('./metadata');
const { fetchData } = require('./fetchdata')
const express = require('express');
const { sendToDiscordWebhook } = require('./discordWebhook')
const app = express();
app.use(express.json());

app.post('/token_mint', async (req, res) => {
  try {
    let mintIds = new Set();  // Use a Set to store unique mint IDs
  
    if (!Array.isArray(req.body)) {
        throw new Error("Invalid input: req.body is not an array.");
    }
  
    req.body.forEach((item) => {
        if (item.accountData && Array.isArray(item.accountData)) {
            item.accountData.forEach((accountDataItem) => {
                if (accountDataItem.tokenBalanceChanges !== null && Array.isArray(accountDataItem.tokenBalanceChanges)) {
                    accountDataItem.tokenBalanceChanges.forEach((change) => {
                        if (change.mint && change.mint !== 'So11111111111111111111111111111111111111112') {
                            mintIds.add(change.mint); // Add unique and non-excluded mint IDs
                        }
                    });
                }
            });
        }
    });
    
    console.log("Unique Mint IDs:", Array.from(mintIds));  // Convert the Set to an Array for display

// Use a for...of loop to handle async operations
for (const mintId of mintIds) {
  console.log("inserting " + mintId + " into code block");
  try {
      console.log("getings URI")
      const uri = await getTokenMetadata(mintId);
      console.log("getings Data")
      const metaData = await fetchData(uri, mintId)
      console.log("Sending webhook" + metaData)
      await sendToDiscordWebhook(metaData)


  } catch (error) {
      console.error("Error fetching metadata for", mintId, ":", error);
  }
}
  
  } catch (error) {
    console.error("Error in /token_mint route:", error.message);
    res.status(400).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
