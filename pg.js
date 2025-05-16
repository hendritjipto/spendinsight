
import { Client as PgClient } from 'pg';
const clientpg = new PgClient({
  user: 'benchmark',
  host: 'localhost',
  database: 'benchmark',
  password: 'benchmark',
  port: 5432,
});

export default async function connectPG() {
    try {
        await clientpg.connect();
        console.log("✅ PostgreSQL Connected!");
        return clientpg;
    } catch (error) {
        console.error("❌ PostgreSQL Connection Error:", error);}
        // If connection fails, try to create a new client
}