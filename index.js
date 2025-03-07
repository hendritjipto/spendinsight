import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import spendinsightRoutes from "./routes/spendinsightRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transcationRoutes from "./routes/transactionRoutes.js";
import connectDB  from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
    const dbClient = await connectDB();
    app.locals.db = dbClient; // ✅ Store persistent DB connection
})();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/browser', (req, res) => {
    res.sendFile(__dirname + '/html/browsercal.html');
});

app.get('/transaction', (req, res) => {
    res.sendFile(__dirname + '/html/transaction.html');
});

app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/html/profile.html');
});

app.get('/browsercal.js', (req, res) => {
    res.sendFile(__dirname + '/js/browsercal.js');
});

app.get('/transaction.js', (req, res) => {
    res.sendFile(__dirname + '/js/transaction.js');
});

app.get('/index.js', (req, res) => {
    res.sendFile(__dirname + '/js/index.js');
});

// Register category routes with /api/users prefix
app.use("/api/users", userRoutes);
app.use("/api/insight", spendinsightRoutes);
app.use("/api/transaction", transcationRoutes);

app.post('/path', (req, res) => {
    const data = req.body;
    // Process data
    res.send('Data received');
  });

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log(`financialdiary app: listening on port ${port}`);
});