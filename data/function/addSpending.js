import getMonth from "./getMonth.js";
// This function adds a spending transaction to the database
// and updates the total spending and category percentages.     
export default async function addSpending(transaction, client, dbName) {

    const transactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local" },
        writeConcern: { w: "majority" }
    };

    const firstDayOfMonth = await getMonth(transaction.date);

    try {
        const database = client.db(dbName);
        const collection = database.collection('spendinginsight');

        const detailTransaction = {
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount
        };

        await client.withSession(async (session) =>
            session.withTransaction(async () => {
                // Step 1: Add the transaction and update amounts
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

                const result = await collection.updateOne(filter, update, { session });

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
                        { upsert: true, session } // Ensures atomic insert
                    );
                }

                //console.log(`Transaction added successfully for ${transaction.category}`);

                // Step 2: Get the updated document to recalculate percentages
                const updatedDoc = await collection.findOne({ bankAccountNumber: transaction.bankAccountNumber,"month": firstDayOfMonth }, { session });

                if (!updatedDoc || !updatedDoc.spendingInsights) {
                    throw new Error("Document not found after update, aborting transaction.");
                }

                const totalSpending = updatedDoc.totalSpending;

                // Step 3: Prepare bulk operations for percentage updates
                const bulkOps = updatedDoc.spendingInsights.map(insight => {
                    const newPercentage = (insight.totalAmount / totalSpending) * 100;
                    const roundedPercentage = Math.round(newPercentage * 10) / 10; // Round to 1 decimal place

                    return {
                        updateOne: {
                            filter: {
                                bankAccountNumber: transaction.bankAccountNumber,
                                "spendingInsights.category": insight.category,
                                "month": firstDayOfMonth
                            },
                            update: {
                                $set: { "spendingInsights.$.percentage": roundedPercentage }
                            },
                            session
                        }
                    };
                });

                // Step 4: Execute bulk update within the transaction
                if (bulkOps.length > 0) {
                    const bulkResult = await collection.bulkWrite(bulkOps, { session });
                    //console.log(`Updated percentages for ${bulkResult.modifiedCount} categories`);
                    //console.log(`New total spending: $${totalSpending.toFixed(2)}`);
                }
            }, transactionOptions)
        );

        //console.log("✅ Transaction committed successfully");
    } catch (error) {
        console.error("❌ Transaction aborted due to an error:", error);
    } finally {

    }
}