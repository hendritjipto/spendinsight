import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = process.env.DBNAME;
let client;

export default async function connectDB() {
    if (!client) {
        client = new MongoClient(connection);
        await client.connect();
        client = client.db(dbName);
        console.log("✅ MongoDB Connected!");
        return client;
    }
}