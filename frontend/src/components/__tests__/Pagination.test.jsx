import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} hasPrevPage={false} hasNextPage={false} onSetPage={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('disables Prev on the first page and Next on the last page', () => {
    render(<Pagination page={1} totalPages={5} hasPrevPage={false} hasNextPage onSetPage={vi.fn()} />);
    expect(screen.getByText('Prev')).toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
  });

  it('calls onSetPage with the clicked page number', () => {
    const onSetPage = vi.fn();
    render(<Pagination page={2} totalPages={5} hasPrevPage hasNextPage onSetPage={onSetPage} />);
    fireEvent.click(screen.getByText('3'));
    expect(onSetPage).toHaveBeenCalledWith(3);
  });

  it('calls onSetPage with page + 1 when Next is clicked', () => {
    const onSetPage = vi.fn();
    render(<Pagination page={2} totalPages={5} hasPrevPage hasNextPage onSetPage={onSetPage} />);
    fireEvent.click(screen.getByText('Next'));
    expect(onSetPage).toHaveBeenCalledWith(3);
  });
});
