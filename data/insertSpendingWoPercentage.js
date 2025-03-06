
import getRandomTransaction from "./function/getRandomTransaction.js";
import addSpendingWoPercentage from "./function/addSpendingWoPercentage.js";
import addTransaction from "./function/addTransaction.js";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = process.env.DBNAME

const client = new MongoClient(connection);
await client.connect();
console.log("Connected to MongoDB!");

// Generate 1000 random transactions
const transactions = await getRandomTransaction(500);

let startTime;
let endTime;
try {
    startTime = Date.now();
    const database = client.db(dbName);
    const collection = database.collection('transaction');
    await collection.insertMany(transactions);
    for (const transaction of transactions) {
       
        await addSpendingWoPercentage(transaction, client, dbName).catch(console.error);
    }
}
finally {
    await client.close(); 
    endTime = Date.now();
    console.log(`Transaction completed in ${endTime - startTime} ms`);
    console.log("Disconnected from MongoDB!");
}


console.log("✅ 1000 Random Transactions Generated with Bank Account Numbers from userdatasample.json!");
