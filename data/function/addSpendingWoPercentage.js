import { MongoClient } from "mongodb";

// This function adds a spending transaction to the database
// and updates the total spending and category percentages.     
export default async function addTransaction(transaction, client, dbName) {
    try {
        const database = client.db(dbName);
        const collection = database.collection('findi');
     
        const detailTransaction = {
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount
        };
        
        const filter = {
            bankAccountNumber: transaction.bankAccountNumber,
            "spendingInsights.category": transaction.category
        };

        const update = {
            $push: { "spendingInsights.$.transactions": detailTransaction },
            $inc: {
                "spendingInsights.$.totalAmount": transaction.amount,
                "totalSpending": transaction.amount,
                "transactionCount": 1
            }
        };

        const result = await collection.updateOne(filter, update);

        if (result.matchedCount === 0) {
            //console.log(`No matching category found, inserting new category for ${transaction.category}`);
        
            const transactionObj = {
                bankAccountNumber : transaction.bankAccountNumber,
                totalSpending : transaction.amount, 
                spendingInsights : [
                    {
                        category: transaction.category,
                        totalAmount: transaction.amount,
                        percentage: 0, // Placeholder, can be recalculated later
                        transactions: [detailTransaction]
                    }
                ]
            }
            await collection.insertOne(transactionObj);
        }
        //console.log("✅ Transaction committed successfully");
    } catch (error) {
        console.error("❌ Transaction aborted due to an error:", error);
    } finally {
    }
}