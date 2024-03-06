const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { TokenAccount, SPL_ACCOUNT_LAYOUT, LIQUIDITY_STATE_LAYOUT_V4} = require("@raydium-io/raydium-sdk");
const { OpenOrders } = require("@project-serum/serum");
const BN = require("bn.js");
const axios = require('axios');

const connection = new Connection("https://solana-mainnet.core.chainstack.com/3dbe33dea30834cafccfd88dbde184e4", "confirmed");

async function queryLpBaseTokenAmount(mintId) {
    try {
        const baseVaultKey = await findBaseVaultByQuoteMint(mintId);
        const baseVaultPublicKey = new PublicKey(baseVaultKey);
        getPrice(baseVaultPublicKey)
    }
catch(error) {
    console.log("failed to querylpbasetokenamount" + error);
    return;
}
}

async function getPrice(baseVaultPublicKey, webhookUrl, metaData) {

    try {
        var initAmount;
        var hasRugged = false;
        var poolsClosed = false;
        for (let i = 0; i < 100; i++) {
            let message = ""
            const basePubKey = new PublicKey(baseVaultPublicKey);
            const baseDecimals = 9; // Example: SOL and most SPL tokens use 9, but replace with actual value for the token


            var initialPurchase;
            var finalAmount; 
    
            const baseVaultAccountInfo = await connection.getAccountInfo(basePubKey);
        
            if (baseVaultAccountInfo === null) {
                console.log("Failed to find base vault account.");
                return;
            }
    
            // Assuming the account data is in a format that directly stores the token amount
            // For SPL tokens, this involves decoding the account data
            // This part may require adjustment based on the actual data structure and token program used
            const baseTokenAmount = baseVaultAccountInfo.lamports; // This might not directly give token amount for SPL tokens, see below
    
            // Convert the raw token amount into a decimal-adjusted format
            const adjustedBaseTokenAmount = baseTokenAmount / Math.pow(10, baseDecimals);


            if (i === 0) { 
                var now = new Date();
                message = '\n\n\n\n-----------------------------------------------------------------------------------';
                message += `\nl${((now))}`;
                initAmount = adjustedBaseTokenAmount;
            }
            if(i === 3) {
                message += `\nlets pretend I bought here`;
                initialPurchase = adjustedBaseTokenAmount;
                if(initAmount === adjustedBaseTokenAmount) {
                  message = "pools closed sir";
                  poolsClosed = true;
                }
                
            }

            if(i === 20) { 
                finalAmount = adjustedBaseTokenAmount;
                var profitLoss = "profit"
                if(initialPurchase > finalAmount) { profitLoss = "loss" }
                message += `\nlets pretend I sold here I would make ${calculatePercentageDifference(initialPurchase, finalAmount)} percentage ${profitLoss}`;

            }

            else {
                await delay(500); // Pause for 1 second
                //await getPrice(baseVaultPublicKey); // Then call getPrice
                message  += `\nSol in pool: ${metaData.name + " " + adjustedBaseTokenAmount}`;
            }

            if(adjustedBaseTokenAmount < 1) {
              hasRugged = true;
              message = "RUGGED";
            }

            

            await axios.post(webhookUrl, {
                content: message
            });

            if(hasRugged === true || poolsClosed == true) {
              break;
            }

           // console.log("Sol in the LP:", adjustedBaseTokenAmount); // Assuming adjustedBaseTokenAmount is accessible
        }
    }

catch (error) {
console.log("failed to get price" + error);
return;
}
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

async function findBaseVaultByQuoteMint(baseMintId) {
    const liquidityPools = await fetchLiquidityPools(); // Fetch the liquidity pool data
    
    // Find the target pool based on the quoteMint ID
    const targetPool = liquidityPools.find(pool => pool.baseMint === baseMintId);

    //console.log(targetPool);

    if (targetPool) {
        console.log("Found pool for quoteMint ID:", baseMintId);
        console.log("BaseVault Address:", targetPool.baseVault);
        return targetPool.baseVault; // Return the baseVault address of the found pool
    } else {
        console.log("No pool found for quoteMint ID:", baseMintId);
        return null;
    }
}

async function fetchLiquidityPools() {
    try {
        const response = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json');
        if (!response.ok) {
            throw new Error(`Error fetching liquidity pools: ${response.statusText}`);
        }
        const data = await response.json();

        return data.official;
    } catch (error) {
        console.error("Failed to fetch liquidity pools:", error);
        return []; // Return an empty array or handle the error as appropriate
    }
}


const raydiumProgramId = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'); // Use the actual Raydium program ID
const SPLTokenMintAddress = '92d5AncUVELq79xqLWNQ5Zoxz7fn9XHwijYswYWFrKtR';

async function findLiquidityPoolInfo() {
    // This is a conceptual approach. The actual implementation depends on Raydium's data structures.
    const programAccounts = await connection.getProgramAccounts(raydiumProgramId, {
        // Filters would depend on Raydium's account structure for LPs
    });

    // Assuming you have a way to identify the relevant accounts and decode their data
    programAccounts.forEach(account => {
        // Decode and process the account data here
        console.log(account.pubkey.toString());
    });
}

async function getTokenAccounts(connection, owner) {
    const tokenResp = await connection.getTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });
  
    const accounts = [];
    for (const { pubkey, account } of tokenResp.value) {
      accounts.push({
        pubkey,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(account.data),
      });
    }
  
    return accounts;
  }
  
  // raydium pool id can get from api: https://api.raydium.io/v2/sdk/liquidity/mainnet.json
  const SOL_USDC_POOL_ID = "8ysAEsRgrCboDTV4gLzKS6RMrFL1M5PUZAABLjDvru4k";
  const OPENBOOK_PROGRAM_ID = new PublicKey(
    "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
  );
  
   async function parsePoolInfo() {
    const connection = new Connection("https://solana-mainnet.core.chainstack.com/3dbe33dea30834cafccfd88dbde184e4", "confirmed");
    const owner = new PublicKey("VnxDzsZ7chE88e9rB6UKztCt2HUwrkgCTx8WieWf5mM");
  
    const tokenAccounts = await getTokenAccounts(connection, owner);
  
    // example to get pool info
    const info = await connection.getAccountInfo(new PublicKey(SOL_USDC_POOL_ID));
    if (!info) return;
  
    const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(info.data);
    const openOrders = await OpenOrders.load(
      connection,
      poolState.openOrders,
      OPENBOOK_PROGRAM_ID // OPENBOOK_PROGRAM_ID(marketProgramId) of each pool can get from api: https://api.raydium.io/v2/sdk/liquidity/mainnet.json
    );
  
    const baseDecimal = 10 ** poolState.baseDecimal.toNumber(); // e.g. 10 ^ 6
    const quoteDecimal = 10 ** poolState.quoteDecimal.toNumber();
  
    const baseTokenAmount = await connection.getTokenAccountBalance(
      poolState.baseVault
    );
    const quoteTokenAmount = await connection.getTokenAccountBalance(
      poolState.quoteVault
    );
  
    const basePnl = poolState.baseNeedTakePnl.toNumber() / baseDecimal;
    const quotePnl = poolState.quoteNeedTakePnl.toNumber() / quoteDecimal;
  
    const openOrdersBaseTokenTotal =
      openOrders.baseTokenTotal.toNumber() / baseDecimal;
    const openOrdersQuoteTokenTotal =
      openOrders.quoteTokenTotal.toNumber() / quoteDecimal;
  
    const base =
      (baseTokenAmount.value?.uiAmount || 0) + openOrdersBaseTokenTotal - basePnl;
    const quote =
      (quoteTokenAmount.value?.uiAmount || 0) +
      openOrdersQuoteTokenTotal -
      quotePnl;
  
    const denominator = new BN(10).pow(poolState.baseDecimal);
  
    const addedLpAccount = tokenAccounts.find((a) =>
      a.accountInfo.mint.equals(poolState.lpMint)
    );
  
    console.log(
      "SOL_USDC pool info:",
      "pool total base " + base,
      "pool total quote " + quote,
  
      "base vault balance " + baseTokenAmount.value.uiAmount,
      "quote vault balance " + quoteTokenAmount.value.uiAmount,
  
      "base tokens in openorders " + openOrdersBaseTokenTotal,
      "quote tokens in openorders  " + openOrdersQuoteTokenTotal,
  
      "base token decimals " + poolState.baseDecimal.toNumber(),
      "quote token decimals " + poolState.quoteDecimal.toNumber(),
      "total lp " + poolState.lpReserve.div(denominator).toString(),
  
      "addedLpAmount " +
        (addedLpAccount?.accountInfo.amount.toNumber() || 0) / baseDecimal
    );
  }

  function calculatePercentageDifference(initialNumber, finalNumber) {
    // Calculate absolute difference
    let absoluteDifference = Math.abs(finalNumber - initialNumber);
  
    // Calculate the average of the two numbers
    let averageOfNumbers = (initialNumber + finalNumber) / 2;
  
    // Calculate percentage difference
    let percentageDifference = (absoluteDifference / averageOfNumbers) * 100;
  
    return percentageDifference;
  }
  
 // getPrice("DCw9WVBCR62d3JtymiWcrg3zgpfgfimq73fMFfDGxSfE");

module.exports = { getPrice };