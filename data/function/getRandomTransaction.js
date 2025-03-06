import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now create a path that's relative to this file's location
const userData = JSON.parse(fs.readFileSync(path.join(__dirname, "../faker/userdatasample.json"), "utf-8"));

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

export default async function getRandomTransaction(numberofdata) {
    // Generate 100 random transactions with bankAccountNumber from userdatasample.json
    const transactions = Array.from({ length: numberofdata }, () => {
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
    return transactions;
}
