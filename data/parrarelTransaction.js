import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
const dbName = "Bank";
const numOfWorkers = 5; // Adjust the number of workers as needed

// ✅ MAIN THREAD: Spawns workers
if (isMainThread) {
    async function main() {
        console.log(`🚀 Starting ${numOfWorkers} workers...`);

        let workers = [];

        for (let i = 0; i < numOfWorkers; i++) {
            
            const worker = new Worker(new URL(import.meta.url), { workerData: { workerId: i + 1 } });

            worker.on("message", (msg) => console.log(`🟢 Worker ${i + 1}: ${msg}`));
            worker.on("error", (err) => console.error(`❌ Worker ${i + 1} Error: ${err.message}`));
            worker.on("exit", (code) => console.log(`✅ Worker ${i + 1} exited (code ${code})`));

            workers.push(worker);
        }
    }

    main().catch(console.error);

// ✅ WORKER THREAD: Runs transactions
} else {
    async function runTransactions() {
        const { workerId } = workerData;
        console.log(`🔹 Worker ${workerData.workerId} started`);

        const client = new MongoClient(connection);
        await client.connect();

        try {
            const db = client.db(dbName);
            const collection1 = db.collection("newdata");
            const collection2 = db.collection("cattransaction");

            // Example operations
            await collection1.insertOne({ name: `Worker_${workerId}` });
            await collection2.findOneAndUpdate(
                { _id: 1 },
                { $inc: { transactionno: 1 } },
                { upsert: true }
            );

            parentPort.postMessage(`Worker ${workerId} completed transactions.`);
        } catch (error) {
            parentPort.postMessage(`Worker ${workerId} error: ${error.message}`);
        } finally {
            await client.close();
        }
    }

    runTransactions().catch(console.error);
}
