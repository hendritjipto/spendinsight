// This function adds a spending transaction to the database  
export default async function addTransaction(transaction, client, dbName) {
    try {
        const database = client.db(dbName);
        const collection = database.collection('transaction');

        const result = await collection.insertOne(transaction);

    } catch (error) {
        console.error("❌ Transaction aborted due to an error:", error);
    } finally {
    }
}