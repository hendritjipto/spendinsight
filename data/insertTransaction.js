import { MongoClient } from "mongodb";
import executeTransaction from "./function/executeTransaction.js";

import dotenv from "dotenv";
dotenv.config();

var connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = 'Bank'; // Replace with your database name

// Usage Example
async function main() {
    const uri = connection;
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const operations = [
            {
                type: "insert",
                collectionName: "newdata", // ✅ Dynamic collection
                data: { name: "Alice" }
            },
            {
                type: "findOneAndUpdate",
                collectionName: "cattransaction", // ✅ Another collection
                filter: { _id: 1 },
                update: { $inc: { transactionno: 1 } },
                upsert: true
            }
        ];

        await executeTransaction(client, dbName, operations);

    } finally {
        await client.close();
    }
}

main().catch(console.error);