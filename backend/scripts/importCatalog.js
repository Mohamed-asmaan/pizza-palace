require('dotenv').config();
const mongoose = require('mongoose');
const { importCatalog } = require('../utils/importCatalog');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => importCatalog())
  .then((result) => {
    console.log(result.skipped ? 'Nothing to import' : `Imported ${result.imported} pizzas`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error.message);
    process.exit(1);
  });
