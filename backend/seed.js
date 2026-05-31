require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Pizza = require('./models/Pizza');
const { importCatalog } = require('./utils/importCatalog');

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Pizza.deleteMany({});

    const result = await importCatalog();
    console.log(`Catalog import complete (${result.imported} pizzas)`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

runSeed();
