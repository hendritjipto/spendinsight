export const getInsight = async (req, res) => {
    try {
        const db = req.app.locals.db; // ✅ Reuse the persistent DB connection

        let bankAccountNumber = null;
        if (req.query.bankAccountNumber) {
            bankAccountNumber = req.query.bankAccountNumber.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        }

        if (!bankAccountNumber) {
            const users = await db.collection("findi").find().toArray();
            res.json(users);
        }
        else {
            const user = await db.collection("findi").findOne({ bankAccountNumber: bankAccountNumber });
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: error });
    }
};