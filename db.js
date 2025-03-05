import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = "Bank";
let client;

export default async function connectDB() {
    if (!client) {
        client = new MongoClient(connection);
        const dbClient = await client.connect();
        client = dbClient.db(dbName);
        console.log("✅ MongoDB Connected!");
        return client;
    }
}