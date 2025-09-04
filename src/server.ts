/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server;
async function main() {
  try {
    if (config.database_url) {
      await mongoose.connect(config.database_url);
      console.log('Connected to MongoDB');
    }
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

main();

process.on('unhandledRejection', (error) => {
  console.error('😡 Unhandled Rejection:', error);
  if (server) {
    server.close(() => {
      process.exit();
    });
  }
  process.exit();
});

process.on('uncaughtException', () => {
  console.log('😡 Uncaught Exception');
  process.exit();
});
