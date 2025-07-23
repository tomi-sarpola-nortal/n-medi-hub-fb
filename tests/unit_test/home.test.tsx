import { render, screen } from '@testing-library/react';
import Home from '../src/app/[locale]/page';
import '@testing-library/jest-dom';

describe('Home Page', () => {
  it('renders the home page', () => {
    render(<Home />);
    // Add assertions here to check for elements on the home page
    // For example, if your home page has a main heading:
    // expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
