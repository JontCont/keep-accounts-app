import React from 'react';
import { render } from '@testing-library/react';
import { AppIcon } from './AppIcon';
import { describe, it, expect } from 'vitest';

describe('AppIcon', () => {
  it('should render Lucide SVG icon when a valid name is provided', () => {
    const { container } = render(<AppIcon name="home" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.classList.contains('lucide')).toBe(true);
  });

  it('should render raw text/emoji fallback when name is not a Lucide icon', () => {
    const { container, getByText } = render(<AppIcon name="💳" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeNull();
    expect(getByText('💳')).not.toBeNull();
  });
});
