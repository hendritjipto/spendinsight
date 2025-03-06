export const getTransaction = async (req, res) => {
    try {
        const db = req.app.locals.db; // ✅ Reuse the persistent DB connection

        let bankAccountNumber = null;
        if (req.query.bankAccountNumber) {
            bankAccountNumber = req.query.bankAccountNumber.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        }

        if (!bankAccountNumber) {
            const transactions = await db.collection("transaction").find().toArray();
            res.json(transactions);
        }
        else {
            const transactions = await db.collection("transaction").find({ "bankAccountNumber": bankAccountNumber }).toArray();

            // Group transactions by category
            const groupedTransactions = {};
            let totalSpending = 0;

            transactions.forEach(transaction => {
                const { category, amount, date, description } = transaction;

                if (!groupedTransactions[category]) {
                    groupedTransactions[category] = {
                        category,
                        totalAmount: 0,
                        transactions: []
                    };
                }

                // Add transaction details
                groupedTransactions[category].transactions.push({ date, description, amount });

                // Update category total
                groupedTransactions[category].totalAmount += amount;

                // Update total spending
                totalSpending += amount;
            });

            // Calculate percentages
            const spendingInsights = Object.values(groupedTransactions).map(entry => ({
                category: entry.category,
                totalAmount: entry.totalAmount,
                percentage: parseFloat(((entry.totalAmount / totalSpending) * 100).toFixed(2)),
                transactions: entry.transactions
            }));

            // Construct final JSON
            const output = {
                _id: { "$oid": "67c8999290cb458fd29d9c44" },  // Example ID
                bankAccountNumber: transactions[0].bankAccountNumber,
                spendingInsights,
                totalSpending,
                transactionCount: transactions.length
            };     
            if (output) {
                res.json(output);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }
    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ message: error });
    }
};