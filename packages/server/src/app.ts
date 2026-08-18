import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { query } from './db/postgres';
import authRouter from './routes/auth';
import documentsRouter from './routes/documents';
import { startWsServer } from './wsServer';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const runMigrations = async () => {
  try {
    const migrationPath = path.join(__dirname, 'db', 'migrations', '001_init.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await query(sql);
    console.log('Migrations executed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await runMigrations();
  
  app.listen(PORT, () => {
    console.log(`Express API running on port ${PORT}`);
  });

  await startWsServer();
};

startServer().catch(console.error);

export default app;
