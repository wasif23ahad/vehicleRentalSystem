import { Pool } from "pg";

export const withTransaction = async <T>(
  pool: Pool,
  handler: (client: Pool) => Promise<T>
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await handler(client as unknown as Pool);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
