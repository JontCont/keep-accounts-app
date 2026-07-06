import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(baseElement).toBeTruthy();
  });

  it('should have Keep Accounts as the title', () => {
    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(getAllByText(new RegExp('Keep Accounts', 'gi')).length > 0).toBeTruthy();
  });
});
