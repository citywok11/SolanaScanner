// Import necessary components from the SDK
const {
    swap,
    utils: { connection },
    walletAdapter,
  } = require('@raydium-io/raydium-sdk');
  
  async function swapTokensOnRaydium(sourceTokenMint, destinationTokenMint, amountToSwap) {
    // Initialize Solana connection
    const solConnection = new connection.Connection(connection.clusterApiUrl('mainnet-beta'));
  
    // Your wallet details here
    const yourWallet = walletAdapter.getWallet();
  
    // Specify the source and destination tokens
    const sourceToken = { mint: sourceTokenMint, amount: amountToSwap };
    const destinationToken = { mint: destinationTokenMint };
  
    try {
      // Fetch the best swap route
      const routes = await swap.getRoutes({
        connection: solConnection,
        inputMint: new PublicKey(sourceToken.mint),
        outputMint: new PublicKey(destinationToken.mint),
        amount: sourceToken.amount,
        slippage: 0.5, // Adjust slippage according to your needs (in percentage)
      });
  
      if (routes.length === 0) throw new Error('No swap route found');
  
      // Select the best route (example selects the first route)
      const bestRoute = routes[0];
  
      // Construct and send the swap transaction
      const txid = await swap.swap({
        connection: solConnection,
        wallet: yourWallet,
        route: bestRoute,
        userKeys: {
          owner: yourWallet.publicKey,
          // More user-specific keys can be added here if necessary
        },
        amountIn: sourceToken.amount,
        amountOutMinimum: 0, // Set to 0 or calculate based on slippage and route information
      });
  
      console.log(`Swap completed successfully. Transaction ID: ${txid}`);
    } catch (error) {
      console.error('Failed to perform swap:', error);
    }
  }
  