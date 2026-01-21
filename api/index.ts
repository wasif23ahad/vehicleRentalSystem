import app from '../src/app';
import { initDB } from '../src/config/init';

// Initialize the database
initDB().then(() => {
    console.log('Database initialized for Serverless environment');
}).catch(err => {
    console.error('Database initialization failed:', err);
});

export default app;
