require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase } = require('./utils/seedDatabase');

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await seedDatabase({ force: true });
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

runSeed();
