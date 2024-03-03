const { Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");
const { Metadata, PROGRAM_ID, METADATA_SCHEMA } = require("@metaplex-foundation/mpl-token-metadata");
require('./logger'); // This patches console.log

//const mintAddress = '9whtKG9QJXbFj2Boxp13GrS1mmWCcyhHXiuP8BHQaxrP'

//getTokenMetadata(mintAddress);

async function getTokenMetadata(mintAddress) {
    console.log(mintAddress)
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    const mintPublicKey = new PublicKey(mintAddress);

    try{
    // Find the PDA for the token metadata
    const [pda] = await PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mintPublicKey.toBuffer(),
        ],
        PROGRAM_ID
    );
    }
    catch (error) {
        Console.log(error)
    }

try {
    // Fetch the account info
const accountInfo = await connection.getAccountInfo(pda);

if (accountInfo === null) {
    throw new Error("Failed to find account information for given mint address");
    return
}

// Destructure the result of deserialize
const [metadata, newOffset] = Metadata.deserialize(accountInfo.data);

var json = JSON.stringify(metadata)

var url = JSON.parse(json)

//console.log(url)

const uri = url.data.uri

if(uri !== undefined && uri !== null)
{
    console.log(uri)
    return uri
}

}
catch (error) {
}

}

module.exports = { getTokenMetadata };
