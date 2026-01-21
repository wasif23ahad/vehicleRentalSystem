import app from "./app";
import { initDB } from "./config/init";

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

const startServer = async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
