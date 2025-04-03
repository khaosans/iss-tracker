import React from 'react';
import { render, screen } from '@testing-library/react';
import ISSGlobe from '../components/iss-globe';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

describe('ISSGlobe', () => {
  it('renders without errors', () => {
    render(<ISSGlobe />);
    const globeElement = screen.getByTestId('iss-globe');
    expect(globeElement).toBeInTheDocument();
  });
});