const { getTokenMetadata } = require('./metadata');
const { fetchData } = require('./fetchdata')
const express = require('express');
const { sendToDiscordWebhook } = require('./discordWebhook')
const app = express();
app.use(express.json());

app.post('/token_mint', async (req, res) => {
  try {
    let mintIds = new Set();  // Use a Set to store unique mint IDs
    let processedIds = new Set(); // Set to track processed IDs
  
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
    if (processedIds.has(mintId)) {
        console.log(`Skipping duplicate mintId: ${mintId}`);
        continue; // Skip processing if the ID has already been processed
      }
      if (!mintId) {
        console.log("Skipping null or undefined mintId");
        continue; // Skip to the next iteration if mintId is null or undefined
      }
  console.log("inserting " + mintId + " into code block");
  try {      
      //console.log("getings URI")
      processedIds.add(mintId)
      const uri = await getTokenMetadata(mintId);

      if (!uri) {
        console.log(`No URI found for mintId: ${mintId}`);
        continue; // Skip to the next iteration if no URI is returned
      }

      const metaData = await fetchData(uri, mintId)
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
