import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCatalogFilters } from '../useCatalogFilters';

function wrapper({ children }) {
  return <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>;
}

describe('useCatalogFilters', () => {
  it('starts with no filters applied', () => {
    const { result } = renderHook(() => useCatalogFilters(), { wrapper });
    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.page).toBe(1);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('toggleCategory adds then removes a category', () => {
    const { result } = renderHook(() => useCatalogFilters(), { wrapper });

    act(() => result.current.toggleCategory('Audio'));
    expect(result.current.filters.categories).toEqual(['Audio']);

    act(() => result.current.toggleCategory('Audio'));
    expect(result.current.filters.categories).toEqual([]);
  });

  it('combines multiple categories without dropping existing ones', () => {
    const { result } = renderHook(() => useCatalogFilters(), { wrapper });
    act(() => result.current.toggleCategory('Audio'));
    act(() => result.current.toggleCategory('Gaming'));
    expect(result.current.filters.categories.sort()).toEqual(['Audio', 'Gaming']);
  });

  it('changing a filter resets the page back to 1', () => {
    const { result } = renderHook(() => useCatalogFilters(), { wrapper });
    act(() => result.current.setPage(3));
    expect(result.current.filters.page).toBe(3);

    act(() => result.current.toggleCategory('Audio'));
    expect(result.current.filters.page).toBe(1);
  });

  it('changing sort does NOT reset the page', () => {
    const { result } = renderHook(() => useCatalogFilters(), { wrapper });
    act(() => result.current.setPage(2));
    act(() => result.current.setSort('price_asc'));
    expect(result.current.filters.page).toBe(2);
    expect(result.current.filters.sort).toBe('price_asc');
  });

  it('resetAll clears every filter and the page', () => {
    const { result } = renderHook(() => useCatalogFilters(), { wrapper });
    act(() => result.current.toggleCategory('Audio'));
    act(() => result.current.setMinRating(4));
    act(() => result.current.setPage(2));

    act(() => result.current.resetAll());

    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.minRating).toBe(0);
    expect(result.current.filters.page).toBe(1);
    expect(result.current.activeFilterCount).toBe(0);
  });
});
