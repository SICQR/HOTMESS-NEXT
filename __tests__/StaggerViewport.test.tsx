import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StaggerViewport from '@/components/StaggerViewport';

describe('StaggerViewport', () => {
  it('toggles from hidden to show when intersecting', async () => {
    render(
      <StaggerViewport>
        <div>Child</div>
      </StaggerViewport>
    );

    const el = await screen.findByText('Child');
    const container = el.parentElement as HTMLElement;

    expect(container).toHaveAttribute('data-animate', 'hidden');
    expect(container).toHaveAttribute('data-show', 'false');

    await waitFor(() => {
      expect(container).toHaveAttribute('data-animate', 'show');
      expect(container).toHaveAttribute('data-show', 'true');
    });
  });
});
