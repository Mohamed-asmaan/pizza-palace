import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

describe('StatusBadge', () => {
  it('renders order status text', () => {
    render(<StatusBadge status="Pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <BrowserRouter>
        <EmptyState
          icon="🛒"
          title="Empty Cart"
          description="Add items to your cart"
          actionLabel="Browse Menu"
          actionLink="/menu"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Empty Cart')).toBeInTheDocument();
    expect(screen.getByText('Add items to your cart')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Menu' })).toHaveAttribute('href', '/menu');
  });
});
