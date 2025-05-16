

export const getTransactionPG = async (req, res) => {
    try {
        const db = req.app.locals.pg; // ✅ PostgreSQL DB client (like pg or pg-promise)
        //check if db is connected

        let bankAccountNumber = null;
        let month = null;

        if (req.query.bankAccountNumber) {
            bankAccountNumber = req.query.bankAccountNumber
                .trim()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g, "")
                .toLowerCase();
        }

        if (req.query.month) {
            month = req.query.month.trim().toLowerCase();
        }


        if (bankAccountNumber && month) {
            const monthDate = new Date(month);
            const firstDayOfMonth = new Date(Date.UTC(
                monthDate.getFullYear(),
                monthDate.getMonth(),
                1, 0, 0, 0
            ));
            const nextMonth = new Date(firstDayOfMonth);
            nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

            const result = await db.query(
                `SELECT * FROM transaction
                 WHERE bankAccountNumber = $1
                   AND date >= $2 AND date < $3`,
                [bankAccountNumber, firstDayOfMonth.toISOString(), nextMonth.toISOString()]
            );

            const output = groupTrans(result.rows);

            if (output) {
                res.json(output);
            } else {
                res.status(404).json({ message: "User not found" });
            }

        } else if (bankAccountNumber) {
            const result = await db.query(
                `SELECT * FROM transaction WHERE bankAccountNumber = $1`,
                [bankAccountNumber]
            );

            const output = groupTrans(result.rows);

            if (output) {
                res.json(output);
            } else {
                res.status(404).json({ message: "User not found" });
            }

        } else {
            // Fallback: get any transaction and fetch all by that account
            console.log("No bankAccountNumber provided, fetching any transaction");
            const firstResult = await db.query('SELECT * FROM transaction LIMIT 1');
           
            if (firstResult.rows.length === 0) {
                return res.status(404).json({ message: "No transactions found" });
            }

            const fallbackAccount = firstResult.rows[0].bankaccountnumber.toLowerCase();
            const result = await db.query(
                'SELECT * FROM transaction WHERE bankAccountNumber = $1',
                [fallbackAccount]
            );

            const output = groupTrans(result.rows);
            res.json(output);
        }

    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ message: error.message });
    }
};

function groupTrans(transactions) {
    if (!transactions.length) return null;

    const groupedTransactions = {};
    let totalSpending = 0;

    transactions.forEach(transaction => {
        const { category, amount, date, description } = transaction;
        const categoryKey = category || "Uncategorized";

        if (!groupedTransactions[categoryKey]) {
            groupedTransactions[categoryKey] = {
                category: categoryKey,
                totalAmount: 0,
                transactions: []
            };
        }

        // Add transaction details
        groupedTransactions[categoryKey].transactions.push({ date, description, amount });

        // Update totals
        groupedTransactions[categoryKey].totalAmount += Number(amount);
        totalSpending += Number(amount);
    });

    const spendingInsights = Object.values(groupedTransactions).map(entry => ({
        category: entry.category,
        totalAmount: entry.totalAmount,
        percentage: parseFloat(((entry.totalAmount / totalSpending) * 100).toFixed(2)),
        transactions: entry.transactions
    }));

    return {
        bankAccountNumber: transactions[0].bankaccountnumber,
        spendingInsights,
        totalSpending,
        transactionCount: transactions.length
    };
}
