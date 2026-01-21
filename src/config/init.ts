import { pool } from "./db";
import fs from "fs";
import path from "path";

export const initDB = async () => {
    try {
        const sqlPath = path.join(__dirname, "../scripts/init.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Initializing database...");
        await pool.query(sql);
        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1);
    }
};
