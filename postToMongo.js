const { MongoClient } = require('mongodb');

async function insertDataIntoMongoDB(data) {
    var connectionString = 'mongodb+srv://behnam:r8420459O@shitcoindata.at7bcxx.mongodb.net/?retryWrites=true&w=majority&appName=ShitcoinData'
    //const connectionString = connectionString; //process.env.MONGO_CONNECTION_STRING; // Recommended to use environment variable
    const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Specify which database and collection we'll be using
        const db = client.db("ShitCoinDb"); // Replace with your database name
        const collection = db.collection("ShitCoins"); // Replace with your collection name

        // Insert data into the collection
        const result = await collection.insertOne(data);

        console.log(`Data inserted with ID: ${result.insertedId}`);
    } catch (error) {
        console.error("Error inserting data into MongoDB:", error);
    } finally {
        // Ensure that the client will close when you finish/error
        await client.close();
    }
}

module.exports = { insertDataIntoMongoDB };