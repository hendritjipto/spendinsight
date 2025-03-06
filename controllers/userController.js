export const getUsersSpend = async (req, res) => {
    try {
        const db = req.app.locals.db; // ✅ Reuse the persistent DB connection

        const pipeline = [
            {
              $group: {
                _id: "$bankAccountNumber"
              }
            },
            {
              $lookup: {
                from: "account",
                localField: "_id",
                foreignField: "bankAccountNumber",
                as: "accountDetails"
              }
            },
            {
              $unwind: "$accountDetails"
            },
            {
              $project: {
                _id: 0,
                bankAccountNumber: "$_id",
                accountName: "$accountDetails.name"
              }
            }
          ]

        const users = await db.collection("spendinginsight").aggregate(pipeline).toArray();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: error });
    }
};