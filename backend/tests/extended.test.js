const mongoose = require('mongoose');
const request = require('supertest');

let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
  process.env.NODE_ENV = 'test';
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizza-palace-test');
  }
  app = require('../server');
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

describe('Extended API coverage', () => {
  let customerToken;
  let adminToken;
  let pizzaId;
  let orderId;

  beforeEach(async () => {
    const User = require('../models/User');
    const Pizza = require('../models/Pizza');

    await User.create({
      name: 'Extended Customer',
      email: 'ext@test.com',
      password: 'password123',
      role: 'customer',
    });

    await User.create({
      name: 'Extended Admin',
      email: 'extadmin@test.com',
      password: 'password123',
      role: 'admin',
    });

    const custLogin = await request(app).post('/api/auth/login').send({
      email: 'ext@test.com',
      password: 'password123',
    });
    customerToken = custLogin.body.data.token;

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'extadmin@test.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.data.token;

    const pizza = await Pizza.create({
      name: 'Coverage Pizza',
      description: 'For coverage tests',
      price: 400,
      category: 'Specialty',
      imageUrl: 'https://example.com/coverage.jpg',
    });
    pizzaId = pizza._id;
  });

  test('GET /api/auth/profile returns user profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe('ext@test.com');
  });

  test('PUT /api/auth/profile updates user profile', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Updated Customer' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Updated Customer');
  });

  test('POST /api/pizzas rejects non-admin users', async () => {
    const res = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Unauthorized',
        description: 'Should fail',
        price: 100,
        category: 'Veg',
        imageUrl: 'https://example.com/x.jpg',
      });

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/pizzas supports category filter', async () => {
    const res = await request(app).get('/api/pizzas?category=Specialty');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((p) => p.category === 'Specialty')).toBe(true);
  });

  test('PUT /api/pizzas/:id updates pizza as admin', async () => {
    const res = await request(app)
      .put(`/api/pizzas/${pizzaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isAvailable: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isAvailable).toBe(false);
  });

  test('POST /api/orders creates order for checkout flow', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ pizza: pizzaId, qty: 1 }],
        deliveryAddress: '456 Coverage Lane, Delhi',
      });

    expect(res.statusCode).toBe(201);
    orderId = res.body.data._id;
  });

  test('PUT /api/orders/:id/status updates order as admin', async () => {
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ pizza: pizzaId, qty: 1 }],
        deliveryAddress: '456 Coverage Lane, Delhi',
      });

    const res = await request(app)
      .put(`/api/orders/${created.body.data._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Confirmed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Confirmed');
  });

  test('GET /api/orders returns all orders for admin', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ pizza: pizzaId, qty: 1 }],
        deliveryAddress: '456 Coverage Lane, Delhi',
      });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('DELETE /api/pizzas/:id removes pizza as admin', async () => {
    const created = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Delete Me',
        description: 'Temporary pizza',
        price: 199,
        category: 'Veg',
        imageUrl: 'https://example.com/delete.jpg',
      });

    const res = await request(app)
      .delete(`/api/pizzas/${created.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test('returns 404 for invalid pizza id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/pizzas/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});
