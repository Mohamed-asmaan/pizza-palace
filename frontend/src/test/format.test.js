import { describe, it, expect } from 'vitest';
import { formatPrice, getStatusColor, ORDER_STATUSES } from '../utils/format';

describe('format utilities', () => {
  it('formats price in INR', () => {
    expect(formatPrice(299)).toContain('299');
  });

  it('returns status colors for all order statuses', () => {
    ORDER_STATUSES.forEach((status) => {
      expect(getStatusColor(status)).toBeTruthy();
    });
  });
});
