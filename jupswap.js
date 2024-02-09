const { PublicKey, Connection, Keypair, VersionedTransaction } = require('@solana/web3.js');
const fetch = require('cross-fetch');
const { Wallet } = require('@project-serum/anchor');
const bs58 = require('bs58');
const { TOKEN_PROGRAM_ID, MintLayout } = require('@solana/spl-token');
const { ConsoleLogEntry } = require('selenium-webdriver/bidi/logEntries');


async function getTotalSupply(mintAddress) {
  const connection = new Connection("https://solana-mainnet.core.chainstack.com/3dbe33dea30834cafccfd88dbde184e4", "confirmed");
  const mintPublicKey = new PublicKey(mintAddress);
  
  const mintAccountInfo = await connection.getAccountInfo(mintPublicKey);
  if (mintAccountInfo === null) {
    throw new Error('Failed to find mint account');
  }
  
  const mintData = MintLayout.decode(mintAccountInfo.data);
  const totalSupply = mintData.supply;
  return totalSupply;
}

async function getParsedTokenAccountsByOwner(ownerPublicKey, rpcUrl) {
  const connection = new Connection(rpcUrl, 'confirmed');
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(ownerPublicKey),
    { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') } // This is the address of the SPL Token program
  );

  return tokenAccounts.value.map(({ pubkey, account }) => ({
    address: pubkey.toString(),
    mintAddress: account.data.parsed.info.mint,
    owner: account.data.parsed.info.owner,
    tokenAmount: account.data.parsed.info.tokenAmount.uiAmount,
    tokenAmountRaw: account.data.parsed.info.tokenAmount.amount,
    decimals: account.data.parsed.info.tokenAmount.decimals,
  }));
}

async function getJupValueForOneSol() {
  const solMint = 'So11111111111111111111111111111111111111112'; // SOL mint address
  const jupMint = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'; // JUP mint address (example, replace with actual JUP mint address if different)
  const amountInLamports = 100000000; // 1 SOL in lamports
  const slippageBps = '50'; // 0.5%

  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${solMint}&outputMint=${jupMint}&amount=${amountInLamports}&slippageBps=${slippageBps}`;
  const quoteResponse = await (await fetch(quoteUrl)).json();

  console.log({ quoteResponse });
  if(quoteResponse && quoteResponse.outputAmount) {
      const jupForOneSol = quoteResponse.outputAmount / (10 ** quoteResponse.outputDecimals); // Adjust based on JUP's decimal
      console.log(`Amount of JUP for 1 SOL: ${jupForOneSol}`);
  } else {
      console.log("Failed to fetch quote or parse response.");
  }
}

// Initialize connection
const connection = new Connection('https://solana-mainnet.core.chainstack.com/3dbe33dea30834cafccfd88dbde184e4');

// Create the Keypair and Wallet
const secretKeyArray = [152,54,90,131,160,119,2,163,149,232,153,15,217,168,9,222,223,195,238,220,73,114,40,49,189,78,215,148,30,63,112,86,48,67,219,159,95,122,80,184,132,230,85,78,55,39,139,240,4,201,147,128,176,26,229,45,50,185,60,120,3,11,205,163];
const secretKeyUint8Array = new Uint8Array(secretKeyArray);
const keypair = Keypair.fromSecretKey(secretKeyUint8Array);
const wallet = new Wallet(keypair);

async function getTokenValueForOneSol(tokenMint) {
  const solMint = 'So11111111111111111111111111111111111111112'; // SOL mint address
  const amountInLamports = 1000000000; // 1 SOL in lamports (adjusted for accuracy)
  const slippageBps = '50'; // 0.5%

  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${solMint}&outputMint=${tokenMint}&amount=${amountInLamports}&slippageBps=${slippageBps}`;
  try {
    const quoteResponse = await (await fetch(quoteUrl)).json();

    console.log(quoteResponse)
    if (quoteResponse && quoteResponse.outAmount) {
      const tokenForOneSol = quoteResponse.outputAmount / (10 ** quoteResponse.outputDecimals); // Adjust based on token's decimals
      console.log(`Amount of ${tokenMint} for 1 SOL: ${tokenForOneSol}`);
      return tokenForOneSol;
    } else  {
      console.log("Failed to fetch quote or parse response.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}

async function getUSDPriceForSol() {
  // Token you want to get the USD price for
  const inputMint = 'So11111111111111111111111111111111111111112'; // Example: SOL's mint address
  // Mint address for USDC (a stablecoin pegged to USD) on Solana
  const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  // Amount of the token in its smallest unit (e.g., lamports for SOL)
  const amount = '1000000000'; // Example amount in lamports (1 SOL = 1,000,000,000 lamports)
  const slippageBps = '50'; // 0.5% slippage
  
  // Adjust the quote URL to use the USDC mint address as the outputMint
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${usdcMint}&amount=${amount}&slippageBps=${slippageBps}`;
  const quoteResponse = await (await fetch(quoteUrl)).json();

  console.log({ quoteResponse });
  if (quoteResponse && quoteResponse.outAmount) {
    // Convert the output amount to a human-readable format (considering USDC has 6 decimals)
    const priceInUSD = quoteResponse.outAmount / (10 ** 6); // USDC typically uses 6 decimals
    console.log(`Price for the token in USD: ${priceInUSD}`);
  } else {
    console.log("Failed to fetch quote or parse response.");
  }
}

async function getQuoteResponse(outputMint) {
  // Fetching the quote response
  const inputMint = 'So11111111111111111111111111111111111111112';
  const amount = '10000000';
  const slippageBps = '5000'; // 0.5%
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
  const quoteResponse = await (await fetch(quoteUrl)).json();

  console.log({ quoteResponse });
  return quoteResponse;
}

async function peformTransaction(outputMint) {

  console.log("performing transaction")
    // Fetching the quote response
    const inputMint = 'So11111111111111111111111111111111111111112';
    const amount = '1000000';
    const slippageBps = '50'; // 0.5%
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    const quoteResponse = await (await fetch(quoteUrl)).json();

    console.log({ quoteResponse });

    // Fetching the swap transaction
    const swapTransaction = await getSwapTransaction(wallet, quoteResponse);

// deserialize the transaction
const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
console.log("this is the transaction :" + transaction);

// sign the transaction
transaction.sign([wallet.payer]);

let now = new Date();
console.log("executing now :" + now);

// Execute the transaction
const rawTransaction = transaction.serialize()
const txid = await connection.sendRawTransaction(rawTransaction, {
  skipPreflight: true,
  maxRetries: 2
});
// Use a confirmation strategy
const confirmationStrategy = {
  commitment: "confirmed", // Or "confirmed" based on your requirement for reliability vs. speed
};

// Await the confirmation using the updated method
const confirmation = await connection.confirmTransaction({ signature: txid, ...confirmationStrategy });
console.log(`Transaction confirmed with status: ${confirmation.value.err ? 'Error' : 'Success'}`);
console.log(`Confirmed transaction: https://solscan.io/tx/${txid}`);

}

async function getSwapTransaction(wallet, quoteResponse) {
    try {
      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // quoteResponse from /quote api
          quoteResponse,
          // user public key to be used for the swap
          userPublicKey: wallet.publicKey.toString(),
          // auto wrap and unwrap SOL. default is true
          wrapAndUnwrapSol: true,
          // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
          // feeAccount: "fee_account_public_key"
          prioritizationFeeLamports: 'auto' // or custom lamports: 1000
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const { swapTransaction } = await response.json();
      console.log(swapTransaction);
      return swapTransaction;
    } catch (error) {
      console.error('Error fetching swap transaction:', error);
      throw error; // Rethrow or handle error as appropriate for your application
    }
  }

  peformTransaction('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN').catch(console.error).finally(() => process.exit());

  module.exports = { peformTransaction };