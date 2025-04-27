export const getTransaction = async (req, res) => {
    try {
        const db = req.app.locals.db; // ✅ Reuse the persistent DB connection

        let bankAccountNumber = null;
        let month = null;
        if (req.query.bankAccountNumber) {
            bankAccountNumber = req.query.bankAccountNumber.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        }

        if (req.query.month) {
            month = req.query.month.trim().toLowerCase();
        }

        if (bankAccountNumber && month) {
            // First create a proper Date object for the first day of the month
            const monthDate = new Date(month);
            // Create a proper first day of the month at midnight UTC
            const firstDayOfMonth = new Date(Date.UTC(
                monthDate.getFullYear(),
                monthDate.getMonth(),
                1, 0, 0, 0
            ));
            // Create a date that's the first day of the next month
            const nextMonth = new Date(firstDayOfMonth);
            nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
            
            // Create the query pipeline with date range between firstDayOfMonth and nextMonth
            let pipeline = { 
                "bankAccountNumber": bankAccountNumber, 
                "date": { 
                    $gte: firstDayOfMonth, 
                    $lt: nextMonth 
                } 
            };
            
            const transactions = await db.collection("transaction").find(pipeline).toArray();
          
            // let explain = await db.collection("transaction").find(pipeline).explain("allPlansExecution")
            //  console.log(JSON.stringify(explain, null, 2));
            
            const output = groupTrans(transactions);

            if (output) {
                res.json(output);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }
        else if(bankAccountNumber) {
            const transactions = await db.collection("transaction").find({ "bankAccountNumber": bankAccountNumber }).toArray();
            const output = groupTrans(transactions);

            if (output) {
                res.json(output);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }       
        else {
            var transactions = await db.collection("transaction").findOne();
            bankAccountNumber = transactions.bankAccountNumber;
            transactions = await db.collection("transaction").find({ "bankAccountNumber": bankAccountNumber }).toArray();
            const output = groupTrans(transactions);
            res.json(output);
        }

    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ message: error });
    }
};

function groupTrans(transactions) {
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
    return output;
}