import getMonth from "./getMonth.js";
// This function adds a spending transaction to the database
// and updates the total spending and category percentages.     
export default async function addSpendingWoPercentage(transaction, client, dbName) {
    try {
        const database = client.db(dbName);
        const collection = database.collection('spendinginsight');

        const detailTransaction = {
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount
        };
        const firstDayOfMonth = await getMonth(transaction.date);
        const filter = {
            bankAccountNumber: transaction.bankAccountNumber,
            "spendingInsights.category": transaction.category,
            "month": firstDayOfMonth
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

            await collection.updateOne(
                {
                    bankAccountNumber: transaction.bankAccountNumber,
                    "month": firstDayOfMonth
                },
                {
                    $push: {
                        spendingInsights: {
                            category: transaction.category,
                            totalAmount: transaction.amount,
                            percentage: 0, // Placeholder, can be recalculated later
                            transactions: [detailTransaction]
                        }
                    },
                    $inc: {
                        totalSpending: transaction.amount,
                        transactionCount: 1
                    }
                },
                { upsert: true } // Ensures atomic insert
            );
        }
        //console.log("✅ Transaction committed successfully");
    } catch (error) {
        console.error("❌ Transaction aborted due to an error:", error);
    } finally {
    }
}