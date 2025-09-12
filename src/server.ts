/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server;
async function main() {
  try {
    if (config.database_url) {
      await mongoose.connect(config.database_url, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });
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
  // Silently handle unhandled rejections without logging
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  // Silently handle uncaught exceptions without logging
  process.exit(1);
});
