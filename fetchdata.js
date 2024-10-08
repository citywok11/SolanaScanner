const axios = require('axios');
require('./logger'); // This patches console.log

async function fetchData(uri, mintId) {
    try {
        //console.log(mintId);

        // Make the request and get the response object
        const response = await axios.get(uri);

        // The actual data is in the 'data' property of the response
        const json = response.data;

        const twitter = json.extensions?.twitter
        const telegram = json.extensions?.telegram
        const website = json.extensions?.website
        const name = json.name
        const symbol = json.symbol
        const creator = json.creator

        console.log(json)

        //if (twitter && website && symbol && name) {
            // All properties are neither null nor undefined
            const metaData = {
                name : name,
                symbol : symbol,
                mintId: mintId,
                twitter: twitter,
                telegram: telegram,
                website: website,
                poolOpened: new Date().toISOString(),
                creator: creator
            }

            return metaData
            
         //   };


    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

module.exports = { fetchData };
