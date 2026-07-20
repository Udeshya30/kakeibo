import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RootLayout } from '@/app/router/RootLayout';

describe('RootLayout', () => {
  it('renders a skip link and all primary navigation destinations', () => {
    render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');

    for (const destination of ['Dashboard', 'Transactions', 'Plan', 'Insights', 'Review', 'Settings']) {
      expect(screen.getByRole('link', { name: destination })).toBeVisible();
    }
  });
});
