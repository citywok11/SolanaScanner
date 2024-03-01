const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { TokenAccount, SPL_ACCOUNT_LAYOUT, LIQUIDITY_STATE_LAYOUT_V4} = require("@raydium-io/raydium-sdk");
const { OpenOrders } = require("@project-serum/serum");
const BN = require("bn.js");

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

async function queryLpBaseTokenAmount() {
  /*  // Convert the baseVault address string to a PublicKey
    lpMintId = "5cPjqubakPWUGrAqVtnQ7ppbirxCrTjTUeAHj2snDV4k";
    // Assuming you have a way to fetch or already have the JSON data loaded into `liquidityPools`
    const liquidityPools = await fetchLiquidityPools(); // This should be an async function that fetches and returns the liquidity pool data
    const targetPool = liquidityPools.find(pool => pool.baseVault === lpMintId);

    if (!targetPool) {
        console.log('Target liquidity pool not found.');
        return;
    }
    */

    const baseDecimals = 9; // Example: SOL and most SPL tokens use 9, but replace with actual value for the token


    const connection = new Connection("https://solana-mainnet.core.chainstack.com/3dbe33dea30834cafccfd88dbde184e4", "confirmed");

    const baseVaultKey = await findBaseVaultByQuoteMint("D5fqqiMnwyQqSVw9PJJS8VtCgGJdnbPLTmeaw6iDE4jX");

    // Fetch account info
    const baseVaultAccountInfo = await connection.getAccountInfo(new PublicKey(baseVaultKey));
  
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


    console.log("Base Token Amount in the LP:", adjustedBaseTokenAmount);
}

async function findBaseVaultByQuoteMint(baseMintId) {
    const liquidityPools = await fetchLiquidityPools(baseMintId); // Fetch the liquidity pool data

    console.log(liquidityPools);
    
    // Find the target pool based on the quoteMint ID
    const targetPool = liquidityPools.find(pool => pool.baseMint === baseMintId);

    console.log(targetPool);

    if (targetPool) {
        console.log("Found pool for quoteMint ID:", baseMintId);
        console.log("BaseVault Address:", targetPool.baseVault);
        return targetPool.baseVault; // Return the baseVault address of the found pool
    } else {
        console.log("No pool found for quoteMint ID:", baseMintId);
        return null;
    }
}

async function fetchLiquidityPools(quoteMintId) {
    try {
        const response = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json');
        if (!response.ok) {
            throw new Error(`Error fetching liquidity pools: ${response.statusText}`);
        }
        const data = await response.json();

        //console.log(data); // Log the raw data to inspect its structure


        // Filter the data to include only the pools that match the provided quoteMintId
        //const filteredData = data.official.find(pool => pool.baseMint === quoteMintId);

//console.log(filteredData);

        return data.official; // This will return an array of objects that match the quoteMintId
    } catch (error) {
        console.error("Failed to fetch liquidity pools:", error);
        return []; // Return an empty array or handle the error as appropriate
    }
}


/* async function fetchLiquidityPools() {
    // This function should fetch the liquidity pool data from the API and return it
    // For demonstration purposes, returning a static array here
    return [
        { "quoteMint":"5cPjqubakPWUGrAqVtnQ7ppbirxCrTjTUeAHj2snDV4k","lpMint":"Jbv3k2DPqBpabTnZCojUb89e1Xhb9HrTeDupnFMgBZc","baseDecimals":9,"quoteDecimals":9,"lpDecimals":9,"version":4,"programId":"675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8","authority":"5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1","openOrders":"7ai6tXgUNX37Ro2zzLWcDRwstvjeqPFnzc2TmnzC8Nz2","targetOrders":"FzXUMYhXDiyo6rUPBPYk5Z9vr5qNzExQ2JH43CfmxUc5","baseVault":"HL7CJKAavRGBbh4QFenvYWVY1HpmesjbjEKMNfcvGKqM","quoteVault":"CoqMY4SmBm5CUb17dY27QZ9TvxWQkwc5J2nZtjyqw6c4","withdrawQueue":"11111111111111111111111111111111","lpVault":"11111111111111111111111111111111","marketVersion":4,"marketProgramId":"srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX","marketId":"35zJ5CbC59MU6ZRiLXHY9fuXLorPyXuKwPTCTRzvRRQ5","marketAuthority":"2mGDyvYGBE2Y3cnLrFWrdtb57yq3T9B2oeFdJgT88KRW","marketBaseVault":"DmWzg3Bfs395tdJy4A1rahE5k6DZb6XvdPY6CTCSfNsB","marketQuoteVault":"DoJhfPfYG6T7pbAYCvNWSw4DpjSmQNNVw9fMyAX8bmzj","marketBids":"DoUwhSEkXVjSqE8oTFQ13DH2jr8XiNiJoGYEiQQBKFr1","marketAsks":"BVXsR369gxwB8TQ3D8U4a56BvBUoBrKwXG5DZDmkohAA","marketEventQueue":"CsRMZm4bpShiN83WFEDoo6EVh8FCyagjmfhouDQ4o7zp","lookupTableAccount":"6u6NUU24gwHwBDP6ZgZZFe9YZxkVpmPzDivtAMFSsFSL"},{"id":"rNGoczq2MTdea9hiDi3gxxmXgxDN5CKQ6EA11gZ9G96","baseMint":"6k5T2T7tGc7PhLZygg8N7VUzmDCGHUxjKra67p4ix1sW","quoteMint":"So11111111111111111111111111111111111111112","lpMint":"8ysAEsRgrCboDTV4gLzKS6RMrFL1M5PUZAABLjDvru4k","baseDecimals":9,"quoteDecimals":9,"lpDecimals":9,"version":4,"programId":"675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8","authority":"5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1","openOrders":"2aDFGpg8Js6a6j7PQaAYu7T6XvUyUtpZuChSwqsiuLFj","targetOrders":"3PgX4bu4ybcr9NwtzoT7gZTGMxrt3XWuwH2qNJuDAdKG","baseVault":"GY5VPq6QuTsAXXWxoKkoEA7nWwUfiVqExEGriXbU8DmX","quoteVault":"82frXcHqTRCR85Ai5d6BTSfzW5NLWfyb8mzHZTbKLqNr","withdrawQueue":"11111111111111111111111111111111","lpVault":"11111111111111111111111111111111","marketVersion":4,"marketProgramId":"srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX","marketId":"3sva4xLxh2qghLmkM2JyFYndcoALVa2NavMAwbn78CkM","marketAuthority":"4ayiKJgrKWaFQ5hVNssxqDGPWXkVe5FHpp4JkXFXA9iB","marketBaseVault":"CtvedjtFpRzmK45ryYi4rwybCjv6UQb1kJy83hT7LLTR","marketQuoteVault":"ETCZTjMkMujipsoS2a8YW1fCqf3h55UqAPJPzEFmVaC","marketBids":"BrFooVP7UpCHjzV8qmaR2PG4w9W89zVfRvjDTzyQFkCj","marketAsks":"FwJcZQtaZcAsU1oib21cUy9rcJ2PazTGjnRiSQ4zG3QL" }
    ];
} */

queryLpBaseTokenAmount();