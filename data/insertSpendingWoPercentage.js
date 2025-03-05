import { faker } from "@faker-js/faker";
import fs from "fs";
import addTransaction from "./function/addSpendingWoPercentage.js";
import { MongoClient } from "mongodb";

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = process.env.DBNAME

const client = new MongoClient(connection);
await client.connect();
console.log("Connected to MongoDB!");
// Load the user data from userdatasample.json
const userData = JSON.parse(fs.readFileSync("./faker/userdatasample.json", "utf-8"));

// JSON dictionary of Indonesian companies by category
const categories = {
    "Groceries": { "icon": "🛒", "companies": ["IndoMrt", "AlphaMart", "HyperMrt", "SuperIndo", "Carrfour Indo", "TransMrt"] },
    "Rent": { "icon": "🏠", "companies": ["Agung PodoLand", "Citra Group", "SummareKon", "Pakuwon Dev", "Lippo K"] },
    "Utilities": { "icon": "💡", "companies": ["PLX", "PDAW", "ICONX", "Telkom Nusantara", "IndoHome", "FirstNet"] },
    "Entertainment": { "icon": "🎬", "companies": ["CineMax XXI", "CGX Indo", "Taman Nusantara", "DufArena", "Bali Safari Land", "Ancal"] },
    "Dining": { "icon": "🍽️", "companies": ["McD Nusantara", "KFC Indo", "HokaBen", "SateKhas Senayan", "Bebek Karyo", "Warung Tagal"] },
    "Transportation": { "icon": "🚗", "companies": ["GoDrive", "GrabX", "Blue Taxi", "DAMRU", "TransNusa", "Angkasa Wira"] },
    "Shopping": { "icon": "🛍️", "companies": ["TokoPediea", "Shopi Indo", "Lazadoo", "BliBliX", "BukaToko", "Zalorra Indo"] },
    "Health": { "icon": "⚕️", "companies": ["Silom Hospitals", "Mitra Kesehatan", "Maya Medika", "BPJS Sehat", "Kima Farma", "Apotek K25"] },
    "Education": { "icon": "📚", "companies": ["Gramedio", "Zen Edu", "RuangBelajar", "Univ Indo", "Institut Teknologi Nusantara", "Gajah Mada Univ"] }
};

// Generate 100 random transactions with bankAccountNumber from userdatasample.json
const transactions = Array.from({ length: 1000 }, () => {
    const randomUser = faker.helpers.arrayElement(userData); // Pick a random user
    const bankAccountNumber = randomUser.bankAccountNumber; // Get the bankAccountNumber
    const category = faker.helpers.objectKey(categories); // Random category
    const description = faker.helpers.arrayElement(categories[category].companies); // Random company from category
    const amount = faker.datatype.number({ min: 1, max: 200 }) * 10000; // Random amount in IDR
    //const amount = 75;
    const date = faker.date.between('2025-02-01T00:00:00.000Z', '2025-04-01T00:00:00.000Z'); // Random date in last 3 months

    return {
        bankAccountNumber,
        category,
        description,
        amount,
        date
    };
});
let startTime;
let endTime;
try {
    startTime = Date.now();
    for (const transaction of transactions) {
        await addTransaction(transaction, client, dbName).catch(console.error);
    }
}
finally {
    await client.close(); 
    endTime = Date.now();
    console.log(`Transaction completed in ${endTime - startTime} ms`);
    console.log("Disconnected from MongoDB!");
}


console.log("✅ 1000 Random Transactions Generated with Bank Account Numbers from userdatasample.json!");
