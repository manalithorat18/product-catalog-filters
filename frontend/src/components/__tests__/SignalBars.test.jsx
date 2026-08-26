import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SignalBars from '../SignalBars';

function countFilledBars(container) {
  return container.querySelectorAll('.bg-signal').length;
}

describe('SignalBars', () => {
  it('fills bars rounded to the nearest whole rating', () => {
    const { container } = render(<SignalBars rating={3.6} />);
    expect(countFilledBars(container)).toBe(4); // rounds up
  });

  it('fills zero bars for a rating below 0.5', () => {
    const { container } = render(<SignalBars rating={0.2} />);
    expect(countFilledBars(container)).toBe(0);
  });

  it('fills all five bars for a perfect rating', () => {
    const { container } = render(<SignalBars rating={5} />);
    expect(countFilledBars(container)).toBe(5);
  });

  it('respects an explicit filledOverride instead of the rating', () => {
    const { container } = render(<SignalBars rating={5} filledOverride={2} />);
    expect(countFilledBars(container)).toBe(2);
  });
});
