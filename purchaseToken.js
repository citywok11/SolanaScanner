// Import necessary components from the SDK
const {swap} = require('@raydium-io/raydium-sdk');
const RaydiumSwap = require('./raydiumSwap.js'); // Adjust the path as necessary
const { Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");

const bs58 = require('bs58');


const bip39 = require('bip39');
const { Keypair } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const { mnemonicToSeedSync } = require('bip39');

  const walletAddress = '4FQaqSHJzQhJ4dGYHYiphdGHWpaUphVifLdREv4dciee';
  const amountToSwap = 0.1

  //const mnemonic = "impulse chapter uncover harbor trap measure resist scheme know poem cotton disorder";
  //const walletKeypair = generateKeypairFromMnemonic(mnemonic);

 


  //swapTokensOnRaydium(solMint, jupMint,amountToSwap)


  // Convert the numeric array to a Uint8Array
//const privateKeyUint8Array = new Uint8Array(WALLET_PRIVATE_KEY);

// Encode the Uint8Array to a Base58 string
//const privateKeyBase58 = bs58.encode(privateKeyUint8Array);
  
  
async function performSwap(amount, maxLamports, tokenMint, solMint, RPC_URL, privateKeyBase58) {
    // Load all pool keys from Raydium
    const raydiumSwap = new RaydiumSwap.default(RPC_URL, privateKeyBase58);
    await raydiumSwap.loadPoolKeys();
  
    // Define token mint addresses for the swap
    const mintA = tokenMint;
    const mintB = solMint;
  
    // Find pool information for these tokens
    const poolInfo = raydiumSwap.findPoolInfoForTokens(mintA, mintB);
    if (!poolInfo) {
      console.error('Pool for specified tokens not found.');
      return;
    }
  
    // Specify the swap details
    const toToken = mintA; // The token you want to receive
  
    // Get the swap transaction
    const swapTransaction = await raydiumSwap.getSwapTransaction(
      toToken, 
      amount, 
      poolInfo, 
      maxLamports
    );

    try
    {        
        await raydiumSwap.sendVersionedTransaction(swapTransaction)
        // Get the current date and time
const now = new Date();

// Output the timestamp
console.log(now.getTime());
    }
    catch(error) 
    {
        console.error
    }   
        
    // Here you would sign and send the transaction, for example:
    // await raydiumSwap.sendVersionedTransaction(swapTransaction);
  }
  
  module.exports ={ performSwap };