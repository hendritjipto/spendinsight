export default async function executeTransaction(client, dbName, operations) {
    const db = client.db(dbName);

    const transactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local" },
        writeConcern: { w: "majority" }
    };

    let attempt = 0;
    const MAX_RETRIES = 3;

    while (attempt < MAX_RETRIES) {
        attempt++;
        let startTime = Date.now();

        try {
            const result = await client.withSession(async (session) =>
                session.withTransaction(async () => {
                    const results = [];

                    for (const op of operations) {
                        const collection = db.collection(op.collectionName); // 🔥 Dynamic collection selection

                        switch (op.type) {
                            case "aggregation":
                                results.push(await collection.aggregate(op.data, { session }).toArray());
                                break;
                            case "insert":
                                results.push(await collection.insertOne(op.data, { session }));
                                break;
                            case "findOneAndUpdate":
                                results.push(await collection.findOneAndUpdate(
                                    op.filter,
                                    op.update,
                                    { returnDocument: "after", upsert: op.upsert || false, session }
                                ));
                                break;
                            default:
                                throw new Error("Invalid operation type");
                        }
                    }
                    return results;
                }, transactionOptions)
            );

            console.log("✅ Transaction successful!", result);
            return result; // ✅ Exit immediately on success
        } catch (error) {
            if (error.hasErrorLabel("TransientTransactionError") || error.codeName === "WriteConflict") {
                console.warn(`⚡ Retrying transaction (Attempt ${attempt}/${MAX_RETRIES})...`);
                await new Promise(res => setTimeout(res, 100 * attempt)); // Exponential backoff
            } else {
                console.error("❌ Transaction aborted due to an unexpected error:", error);
                throw error; // Stop retries for non-retryable errors
            }
        } finally {
            let endTime = Date.now();
            console.log(`Transaction attempt ${attempt} completed in ${endTime - startTime} ms`);
        }
    }

    throw new Error("🚨 Transaction failed after max retries!");
}


// export default async function executeTransaction(client, dbName, collectionName, operationType, operationData) {
//     const db = client.db(dbName);
//     const collection = db.collection(collectionName);

//     const transactionOptions = {
//         readPreference: "primary",
//         readConcern: { level: "local" },
//         writeConcern: { w: "majority" }
//     };

//     let startTime = Date.now();

//     try {
//         return await client.withSession(async (session) =>
//             session.withTransaction(async () => {
//                 let result;

//                 switch (operationType) {
//                     case "aggregation":
//                         result = await collection.aggregate(operationData, { session }).toArray();
//                         break;

//                     case "insert":
//                         result = await collection.insertOne(operationData, { session });
//                         break;

//                     case "findOneAndUpdate":
//                         result = await collection.findOneAndUpdate(
//                             operationData.filter,
//                             operationData.update,
//                             {
//                                 returnDocument: "after",
//                                 upsert: operationData.upsert || false,
//                                 session
//                             }
//                         );
//                         break;

//                     default:
//                         throw new Error("Invalid operation type");
//                 }

//                 return result;
//             }, transactionOptions)
//         );
//     } catch (error) {
//         if (error.hasErrorLabel('TransientTransactionError') || error.codeName === 'WriteConflict') {
//             console.warn(`❌ WriteConflict detected. Please keep the data on the client and retry the transaction.`);
//         } else {
//             console.error('❌ Transaction aborted due to an unexpected error:', error);
//         }
//     } finally {
//         let endTime = Date.now();
//         console.log(`Transaction completed in ${endTime - startTime} ms`);
//     }
// }