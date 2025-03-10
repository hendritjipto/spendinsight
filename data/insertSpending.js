import getRandomTransaction from "./function/getRandomTransaction.js"; 
import addTransactionAndUpdatePercentages from "./function/addSpending.js";
import addTransaction from "./function/addTransaction.js";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = process.env.DBNAME
;
const client = new MongoClient(connection);
await client.connect();
console.log("Connected to MongoDB!");

const database = client.db(dbName);
const collection = database.collection('spendinginsight');
// await collection.createIndex(
//     { bankAccountNumber: 1, month: 1, "spendingInsights.category": 1 },
//     { unique: true }
// );
// Generate 1000 random transactions
const transactions = await getRandomTransaction(1000);

let startTime;
let endTime;
try {
    startTime = Date.now();
    for (const transaction of transactions) {
        await addTransaction(transaction, client, dbName).catch(console.error);
        //await addTransactionAndUpdatePercentages(transaction, client, dbName).catch(console.error);
    }
}
finally {
    await client.close(); 
    endTime = Date.now();
    console.log(`Transaction completed in ${endTime - startTime} ms`);
    console.log("Disconnected from MongoDB!");
}


console.log("✅ 1000 Random Transactions Generated with Bank Account Numbers from userdatasample.json!");
