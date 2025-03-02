import { MongoClient } from "mongodb";

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = "Bank";
let client;

export default async function connectDB() {
    if (!client) {
        client = new MongoClient(connection);
        await client.connect();
        console.log("✅ MongoDB Connected!");
        return client;
    }
}