export const getInsight = async (req, res) => {
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
            const transactions = await db.collection("spendinginsight").find({ "bankAccountNumber": bankAccountNumber, "month": firstDayOfMonth }).toArray();
            
            // let explain = await db.collection("spendinginsight").find({ "bankAccountNumber": bankAccountNumber, "month": firstDayOfMonth }).explain("allPlansExecution")
            // console.log(JSON.stringify(explain, null, 2));
         
            if (transactions[0]) {
                res.json(transactions);
            } else {
                res.status(404).json({ message: "transactions not found" });
            }
        }
        else if (bankAccountNumber) {
            const transactions = await db.collection("spendinginsight").findOne({ "bankAccountNumber": bankAccountNumber });
            if (transactions) {
                res.json(transactions);
            } else {
                res.status(404).json({ message: "transactions not found" });
            }
        }
        else {
            const transactions = await db.collection("spendinginsight").findOne();
            res.json(transactions);
        }
    } catch (error) {
        console.error("Error fetching spending insight:", error);
        res.status(500).json({ message: error });
    }
};