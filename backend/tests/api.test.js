const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

let mongoServer;
let app;

const connectTestDb = async () => {
  if (mongoose.connection.readyState) {
    return;
  }

  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI);
};

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
  process.env.NODE_ENV = 'test';

  await connectTestDb();
  app = require('../server');
}, 60000);

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Authentication API', () => {
  test('POST /api/auth/register creates a new customer', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('customer');
  });

  test('POST /api/auth/login returns JWT token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('GET /api/auth/profile requires authentication', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});

describe('Pizza API', () => {
  let adminToken;
  let pizzaId;

  beforeEach(async () => {
    const User = require('../models/User');
    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'admin1234',
      role: 'admin',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'admin1234',
    });
    adminToken = loginRes.body.data.token;
  });

  test('POST /api/pizzas creates pizza as admin', async () => {
    const res = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Pizza',
        description: 'A test pizza',
        price: 299,
        category: 'Veg',
        imageUrl: 'https://example.com/pizza.jpg',
      });

    expect(res.statusCode).toBe(201);
    pizzaId = res.body.data._id;
  });

  test('GET /api/pizzas returns available pizzas', async () => {
    await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Pizza',
        description: 'A test pizza',
        price: 299,
        category: 'Veg',
        imageUrl: 'https://example.com/pizza.jpg',
      });

    const res = await request(app).get('/api/pizzas');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/pizzas/:id returns single pizza', async () => {
    const created = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Pizza',
        description: 'A test pizza',
        price: 299,
        category: 'Veg',
        imageUrl: 'https://example.com/pizza.jpg',
      });

    const res = await request(app).get(`/api/pizzas/${created.body.data._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Test Pizza');
  });
});

describe('Order API', () => {
  let customerToken;
  let pizzaId;

  beforeEach(async () => {
    const User = require('../models/User');
    const Pizza = require('../models/Pizza');

    await User.create({
      name: 'Customer',
      email: 'cust@test.com',
      password: 'cust1234',
      role: 'customer',
    });

    const pizza = await Pizza.create({
      name: 'Order Pizza',
      description: 'For orders',
      price: 350,
      category: 'Veg',
      imageUrl: 'https://example.com/order.jpg',
    });
    pizzaId = pizza._id;

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'cust@test.com',
      password: 'cust1234',
    });
    customerToken = loginRes.body.data.token;
  });

  test('POST /api/orders places an order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ pizza: pizzaId, qty: 2 }],
        deliveryAddress: '123 Test Street, Mumbai',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('Pending');
  });

  test('GET /api/orders/my returns customer orders', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ pizza: pizzaId, qty: 1 }],
        deliveryAddress: '123 Test Street, Mumbai',
      });

    const res = await request(app)
      .get('/api/orders/my')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('DELETE /api/orders/:id cancels pending order', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ pizza: pizzaId, qty: 1 }],
        deliveryAddress: '123 Test Street, Mumbai',
      });

    const res = await request(app)
      .delete(`/api/orders/${orderRes.body.data._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
  });
});
