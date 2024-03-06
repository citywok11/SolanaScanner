const { Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");
const { Metadata, PROGRAM_ID } = require("@metaplex-foundation/mpl-token-metadata");

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

async function getTokenMetadata(mintAddress) {
    console.log(mintAddress)
    const mintPublicKey = new PublicKey(mintAddress);

    // Find the PDA for the token metadata
    const [pda] = await PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mintPublicKey.toBuffer(),
        ],
        PROGRAM_ID
    );
    
try {
    const accountInfo = await connection.getAccountInfo(pda);

    if (accountInfo === null) {
        throw new Error("Failed to find account information for given mint address");
        return
    }

    // Directly deserialize the account info data to get the metadata object
    const [metadata] = Metadata.deserialize(accountInfo.data);

    // Access the uri directly from the metadata object
    if (metadata && metadata.data && metadata.data.uri) {
        return metadata.data.uri;
    } else {
        console.log("URI is undefined or null");
        return null;
    }
}
catch (error) {
}

}

module.exports = { getTokenMetadata };
