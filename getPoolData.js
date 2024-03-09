const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { TokenAccount, SPL_ACCOUNT_LAYOUT, LIQUIDITY_STATE_LAYOUT_V4} = require("@raydium-io/raydium-sdk");
const { OpenOrders } = require("@project-serum/serum");
const BN = require("bn.js");
const axios = require('axios');
const { insertDataIntoMongoDB, addDataToArrayFieldInMongoDB, addDataToRug } = require('./postToMongo');
const { error } = require("selenium-webdriver");
const { MongoClient } = require('mongodb');


const connection = new Connection("https://solana-mainnet.core.chainstack.com/3dbe33dea30834cafccfd88dbde184e4", "confirmed");

async function getPrice(baseVaultPublicKey, webhookUrl, metaData, mongoId, dbName, collectionName, historicalId) {

//console.log(metaData); 

if(!historicalId) {
  console.log("did not insert metaData historical id is " + historicalId)
}

  try {
      let initAmount, initialPurchase, finalAmount;
      let hasRugged = false, poolsClosed = false;
      
      const basePubKey = new PublicKey(baseVaultPublicKey);
      const baseDecimals = 9; // Replace with actual value for the token

      for (let i = 0; i < 100; i++) {
          const baseVaultAccountInfo = await connection.getAccountInfo(basePubKey); //TODO set global
          if (baseVaultAccountInfo === null) {
              console.log("Failed to find base vault account.");
              return;
          }

          const baseTokenAmount = baseVaultAccountInfo.lamports;
          const adjustedBaseTokenAmount = baseTokenAmount / Math.pow(10, baseDecimals);

          let message = "";

          var historicalPriceData = {
            ShitCoinMetaDataId: mongoId,
            TokenName: metaData.name,
            HistoricalData : {
              "Price_0": [
                {
                  AmountOfSolInPool: adjustedBaseTokenAmount,
                  Timestamp: new Date().toISOString()
                }
              ]
            }
          };

          switch (i) {
              case 0:
                  initAmount = adjustedBaseTokenAmount;
                  message = '\n\n\n\n-----------------------------------------------------------------------------------';
                  message += `\n${new Date()}`;

                  console.log(historicalPriceData);

                  historicalPriceData.HistoricalData['Price_0'].AmountOfSolInPool = adjustedBaseTokenAmount;

                  historicalId = await insertDataIntoMongoDB(historicalPriceData, "ShitCoinDb", "ShitCoinHistoricalData", i);

                  try {
                    //inserts entry for first item
                  }
                  catch{ (error)
                      console.log("unable to post shitcoin data to historicalData");
                  }
                  finally {
                      console.log(`price data inserted in to Historical for first item ${historicalId}`);
                  }
                  break;
              case 3:
                  initialPurchase = adjustedBaseTokenAmount;
                  message = "lets pretend I bought here";
                  if (initAmount === adjustedBaseTokenAmount) {
                      console.log("pools closed sir");
                      poolsClosed = true;
                  }
                  break;
              case 40:
                  finalAmount = adjustedBaseTokenAmount;
                  let profitLoss = initialPurchase > finalAmount ? "loss" : "profit";
                  message = `lets pretend I sold here I would make ${calculatePercentageDifference(initialPurchase, finalAmount)} percentage ${profitLoss}`;
                  break;
              default:
                  message = `Sol in pool: ${metaData.name} ${adjustedBaseTokenAmount}`;
                  if(i < 59) {
                  await delay(1000);
                  } else {
                    await delay(60000)
                  }
                  //updateCriteria, newData, arrayFieldName, dbName, collectionName

                  /*const HistoricalData/* = [    
                    {
                      AmountOfSolInPool: adjustedBaseTokenAmount,
                      TokenName: metaData.TokenName,
                      Timestamp: new Date().toISOString()
                    }] */

                    var priceKey = `Price_${i}`;

                    historicalPriceData.HistoricalData[priceKey] = [
                      {
                        AmountOfSolInPool: adjustedBaseTokenAmount, // replace someValue with the actual value
                        Timestamp: new Date().toISOString()
                      }
                    ];

                   addDataToArrayFieldInMongoDB(historicalId, historicalPriceData.HistoricalData[priceKey], priceKey, "HistoricalData", "ShitCoinDb", "ShitCoinHistoricalData", i, metaData.name);
                  break;
          }

          if (adjustedBaseTokenAmount < 1) {
              hasRugged = true;
              message = "RUGGED";
              console.log("RUGGED");
              addDataToRug(historicalId, 'ShitCoinMetaData')
          }

          //await axios.post(webhookUrl, { content: message });

          historicalPriceData.AmountOfSolInPool = adjustedBaseTokenAmount;

          if (hasRugged || poolsClosed) {
              break;
          }
      }
  } catch (error) {
      console.log("failed to get price", error);
  }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  function calculatePercentageDifference(initialNumber, finalNumber) {
    let difference = finalNumber - initialNumber;
    return (difference / initialNumber) * 100;
}

async function getNextSequenceValue(sequenceName, db) {
  try {
    const collectionName = "ShitCoinHistoricalData"
    const sequenceDocument = await client.db.collection(collectionName).findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        {
            new: true,
            upsert: true, // Creates the counter document if it doesn't exist
            returnOriginal: false // Return the updated document
        }
    );
    return sequenceDocument.value.sequence_value;
  }
  catch { (error)
    console.log('unable to get next sequence value' + error);
  }
}

  
 // getPrice("DCw9WVBCR62d3JtymiWcrg3zgpfgfimq73fMFfDGxSfE");

module.exports = { getPrice };