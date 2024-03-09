// db.js
const { MongoClient } = require('mongodb');
const connectionString = 'mongodb+srv://behnam:r8420459O@shitcoindata.at7bcxx.mongodb.net/?retryWrites=true&w=majority&appName=ShitcoinData';

const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, maxPoolSize: 20 });
let dbConnection;

module.exports = {
  connectToServer: async function () {
    try {
      await client.connect(); // Connect to the MongoDB client
      dbConnection = client.db('ShitCoinDb'); // Access the database
      console.log('Successfully connected to MongoDB.');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      throw err; // Rethrow the error so it can be caught where connectToServer is called
    }
  },

  getDb: function () {
    if (!dbConnection) {
      throw new Error('Database connection is not established yet.');
    }
    return dbConnection;
  },

  closeConnection: async function () {
    await client.close();
    console.log('MongoDB connection closed.');
  },
};