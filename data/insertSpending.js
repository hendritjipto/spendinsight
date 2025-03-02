import { MongoClient } from "mongodb";

async function addTransactionAndUpdatePercentages(bankAccountNumber, category, transaction) {
    const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
    const dbName = "Bank";
    const client = new MongoClient(connection);

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection('findi');

        // Step 1: Add the transaction, update the category amount and totalSpending
        const filter = { 
            bankAccountNumber: bankAccountNumber, 
            "spendingInsights.category": category 
        };
        const update = {
            $push: { "spendingInsights.$.transactions": transaction },
            $inc: { 
                "spendingInsights.$.totalAmount": transaction.amount,
                "totalSpending": transaction.amount  // Update the totalSpending field
            }
        };

        const result = await collection.updateOne(filter, update);
        
        if (result.matchedCount === 0) {
            console.log(`No matching category found for bank account number ${bankAccountNumber} and category ${category}`);
            return;
        }
        
        console.log(`Transaction added to category ${category} for bank account number ${bankAccountNumber}`);
        
        // Step 2: Get the updated document to recalculate percentages
        const updatedDoc = await collection.findOne({ bankAccountNumber: bankAccountNumber });
        
        // Step 3: Use the totalSpending field from the document
        const totalSpending = updatedDoc.totalSpending;
        
        // Step 4: Prepare bulk operations to update all percentages
        const bulkOps = updatedDoc.spendingInsights.map(insight => {
            const newPercentage = (insight.totalAmount / totalSpending) * 100;
            // Round to 1 decimal place
            const roundedPercentage = Math.round(newPercentage * 10) / 10;
            
            return {
                updateOne: {
                    filter: { 
                        bankAccountNumber: bankAccountNumber,
                        "spendingInsights.category": insight.category 
                    },
                    update: {
                        $set: { "spendingInsights.$.percentage": roundedPercentage }
                    }
                }
            };
        });
        
        // Step 5: Execute all percentage updates in one bulk operation
        if (bulkOps.length > 0) {
            const bulkResult = await collection.bulkWrite(bulkOps);
            console.log(`Updated percentages for ${bulkResult.modifiedCount} categories`);
            console.log(`New total spending: $${totalSpending.toFixed(2)}`);
        }
        
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await client.close();
    }
}

// Example usage
const bankAccountNumber = "1234567890";
const category = "Groceries";
const transaction = {
    description: "Local Market",
    amount: 75.00,
    date: new Date().toISOString()
};

addTransactionAndUpdatePercentages(bankAccountNumber, category, transaction).catch(console.error);