import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const runMigration = async () => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Neon sometimes
    });

    try {
        const sqlPath = path.join(__dirname, "init.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Running migration...");
        await pool.query(sql);
        console.log("Migration completed successfully. Tables created.");

        // Verify
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log("Current tables:", res.rows.map(r => r.table_name));

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
};

runMigration();
