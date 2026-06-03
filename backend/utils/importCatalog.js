// ============================================
// importCatalog.js - LOAD PIZZAS FROM data/pizzas.json INTO MONGODB
// runs when server starts if menu is empty
// ============================================

const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Pizza = require('../models/Pizza');

const CATALOG_PATH = path.join(__dirname, '../data/pizzas.json');

const loadCatalog = () => {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
};

const ensureAdminUser = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) return;

  await User.create({
    name: ADMIN_NAME || 'Admin',
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log(`Admin account created for ${ADMIN_EMAIL}`);
};

const importCatalog = async () => {
  let imported = 0;
  const pizzaCount = await Pizza.countDocuments();
  if (pizzaCount > 0) {
    console.log('Menu catalog already in database');
  } else {
    const catalog = loadCatalog();
    await Pizza.insertMany(catalog);
    imported = catalog.length;
    console.log(`Imported ${catalog.length} pizzas from backend catalog`);
  }

  await ensureAdminUser();

  return { imported, skipped: pizzaCount > 0 };
};

module.exports = { importCatalog, loadCatalog };
