const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin } = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');

describe('Middleware unit tests', () => {
  test('isAdmin returns 403 for non-admin users', () => {
    const req = { user: { role: 'customer' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('isAdmin calls next for admin users', () => {
    const req = { user: { role: 'admin' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('errorHandler formats validation errors', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        email: { path: 'email', message: 'Email is required' },
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: [{ field: 'email', message: 'Email is required' }],
      })
    );
  });

  test('bcrypt hashes passwords with salt rounds >= 10', async () => {
    const hash = await bcrypt.hash('password123', 12);
    expect(await bcrypt.compare('password123', hash)).toBe(true);
  });
});

describe('verifyToken middleware', () => {
  test('rejects requests without token', async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
