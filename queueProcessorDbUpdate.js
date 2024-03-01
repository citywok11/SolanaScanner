const { Connection, PublicKey } = require('@solana/web3.js');
const { Liquidity } = require('@raydium-io/raydium-sdk');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const bs58 = require('bs58');


  // Initialize connection to the Solana cluster
const connection = new Connection("https://solana-mainnet.core.chainstack.com/3dbe33dea30834cafccfd88dbde184e4");

// SPL Token Mint ID you're interested in
const mintIdKey = new PublicKey("FE5hDZcKR2GdWw9JHGwDPdhq5bjx5zGuMaVJeqEUJBAg");

// The wallet address you want to check for LP token accounts
const ownerAddress = new PublicKey("5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1");

console.log(findLPTokenAccountsByMint(ownerAddress, mintIdKey))

async function findLPTokenAccountsByMint(ownerAddress, mintIdKey) {

  const programIds = {
    4: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'), // Example, replace with actual
    5: new PublicKey('9KEPoZmtHUrBbhWN1v1KWLMkkvwY6WLtAVUCPRtRjP4z')  // Example, replace with actual
  };

  const config = {
    batchRequest: true, // Enable batch requests
    commitment: "confirmed" // Use the "confirmed" commitment level
  };
  
  // Fetch parsed token accounts by owner filtered by the mint ID
  const accounts = await connection.getParsedTokenAccountsByOwner(ownerAddress, {
    programId: TOKEN_PROGRAM_ID,
    mint: mintIdKey,
  });

      // Fetch all liquidity pools information
      const allPoolsInfo = await Liquidity.fetchAllPoolKeys(connection, programIds, config);

      console.log(allPoolsInfo)
    
      // Filter for the specific pool using the LP mint address
     // const specificPoolInfo = allPoolsInfo.find(pool => pool.lpMint.toBase58() === lpMintAddress);
     // console.log(specificPoolInfo);



 // return accounts.value.map(account => ({
 //   lpTokenAccountAddress: account.pubkey.toString(),
 //   amount: account.account.data.parsed.info.tokenAmount.uiAmount,
  //}))
}

findLPTokenAccountsByMint(ownerAddress, mintIdKey).then(accounts => console.log(accounts));
