const { getDb } = require('./db');
const { ObjectId } = require('mongodb');

async function insertDataIntoMongoDB(data, dbName, collectionName, itemNumber) {
    console.log(`inserting data into db: ${dbName} collectionName: ${collectionName}`);
    //const connectionString = connectionString; //process.env.MONGO_CONNECTION_STRING; // Recommended to use environment variable
    const db = getDb(); // Replace with your database name
    const collection = db.collection(collectionName); // Replace with your collection name

    try {
        // Specify which database and collection we'll be using

        console.log(`attempting to insert into ${dbName} and ${collectionName}`)

        //{[`Price_${itemNumber}`]: 

        // Insert data into the collection
        const result = await collection.insertOne(data);

        console.log(data);

        console.log(`Data inserted int ${dbName} and ${collectionName} with ID: ${result.insertedId}`);

        // Return the insertedId

        console.log(`result is ${result}`);

        return result.insertedId.toString();

    } catch (error) {
        console.error(`Error inserting data into MongoDB: for ${collectionName}`, error);
    } finally {
        //did close connection before no longer doing that
    }
}

async function insertDataIntoMongoDBForMetadata(data, dbName, collectionName, bsonName) {
    console.log(`inserting data into db: ${dbName} collectionName: ${collectionName}`);
    //const connectionString = connectionString; //process.env.MONGO_CONNECTION_STRING; // Recommended to use environment variable
    const db = getDb(); // Replace with your database name
    const collection = db.collection(collectionName); // Replace with your collection name

    try {
        // Specify which database and collection we'll be using

        const insertData = {
            "tokenName" : data.name,
            "metaData" : data,
            "liquidityLocked" : false,
        };

        console.log(`attempting to insert into ${dbName} and ${collectionName}`)

        // Insert data into the collection
        const result = await collection.insertOne(insertData);

        console.log(`Data inserted int ${dbName} and ${collectionName} with ID: ${result.insertedId}`);

        return result.insertedId.toString();

    } catch (error) {
        console.error(`Error inserting data into MongoDB: for ${collectionName}`, error);
    } finally {
        //did close connection before no longer doing that
    }
}

async function addDataToArrayFieldInMongoDB(historicalId, newPriceData, index, arrayFieldName, dbName, collectionName, itemNumber) {
    const db = getDb();
    const collection = db.collection(collectionName);

    try {
        console.log(`Attempting to update in ${dbName}.${collectionName}`);

        // Perform the update operation
        const result = await collection.updateOne(
            {_id : new ObjectId(historicalId)},
            { $push: { [index]: newPriceData } },
            { upsert: false } // Set to true if you want to create a new document when no document matches the criteria
        );

        if (result.matchedCount === 0) {
            console.log("No matching document found to update.");
            return null;
        }

        console.log(`Document updated. Matched ${result.matchedCount} and modified ${result.modifiedCount}.`);
        return result;
    } catch (error) {
        console.error(`Error updating data in for hisotricla data, ${"update criteria is:" + historicalId + " newData is:" + historicalPriceData + "arraFieldName is :" + arrayFieldName + "dbName is:" + dbName + "collectionNameIs:" + collectionName} `, error);
    }
}


module.exports = { insertDataIntoMongoDB, addDataToArrayFieldInMongoDB, insertDataIntoMongoDBForMetadata };
