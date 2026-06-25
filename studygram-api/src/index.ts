import app from './app';
import { sequelize } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    // Authenticate and sync Sequelize models with DB
    await sequelize.authenticate();
    console.log('Database connection successfully established.');

    // Sync models (in production, use migrations instead of alter/force)
    await sequelize.sync({ alter: true });
    console.log('Database models successfully synchronized.');

    // Seed database with mock data
    const { seedDatabase } = require('./database/seeders/dbSeeder');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`StudyGram API Server running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/docs`);
    });
  } catch (error: any) {
    console.error('Database connection failed during boot:', error.message);
    process.exit(1);
  }
};

startServer();
