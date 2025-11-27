import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ResponsiveMasonry, ColumnsCountBreakPoints } from '../lib/index';

describe('ResponsiveMasonry Component', () => {
  // Store original window.innerWidth to restore after tests
  const originalInnerWidth = window.innerWidth;

  // Helper to set window width
  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  afterEach(() => {
    // Restore original width
    setWindowWidth(originalInnerWidth);
  });

  describe('Basic rendering', () => {
    it('should render with default breakpoints', () => {
      render(
        <ResponsiveMasonry data-testid="responsive-masonry">
          <div>Child Content</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('data-columns-count');
    });

    it('should render children correctly', () => {
      render(
        <ResponsiveMasonry>
          <div data-testid="child">Test Child</div>
        </ResponsiveMasonry>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <ResponsiveMasonry
          data-testid="responsive-masonry"
          className="custom-class"
          style={{ backgroundColor: 'red' }}
          id="my-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveStyle({ backgroundColor: 'red' });
      expect(container).toHaveAttribute('id', 'my-masonry');
    });
  });

  describe('Responsive column counting', () => {
    const breakpoints: ColumnsCountBreakPoints = {
      300: 2,
      500: 3,
      700: 5,
      900: 6,
    };

    it('should set columns based on breakpoints for small viewport', () => {
      setWindowWidth(400);

      render(
        <ResponsiveMasonry
          columnsCountBreakPoints={breakpoints}
          data-testid="responsive-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveAttribute('data-columns-count', '2');
    });

    it('should set columns based on breakpoints for medium viewport', () => {
      setWindowWidth(600);

      render(
        <ResponsiveMasonry
          columnsCountBreakPoints={breakpoints}
          data-testid="responsive-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveAttribute('data-columns-count', '3');
    });

    it('should set columns based on breakpoints for large viewport', () => {
      setWindowWidth(1000);

      render(
        <ResponsiveMasonry
          columnsCountBreakPoints={breakpoints}
          data-testid="responsive-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveAttribute('data-columns-count', '6');
    });

    it('should use column count of 1 for very small viewport', () => {
      setWindowWidth(200);

      render(
        <ResponsiveMasonry
          columnsCountBreakPoints={breakpoints}
          data-testid="responsive-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveAttribute('data-columns-count', '1');
    });

    it('should use exact breakpoint value', () => {
      setWindowWidth(500);

      render(
        <ResponsiveMasonry
          columnsCountBreakPoints={breakpoints}
          data-testid="responsive-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveAttribute('data-columns-count', '3');
    });
  });

  describe('Resize handling', () => {
    const breakpoints: ColumnsCountBreakPoints = {
      300: 2,
      600: 4,
    };

    it('should update columns on window resize', async () => {
      setWindowWidth(400);

      render(
        <ResponsiveMasonry
          columnsCountBreakPoints={breakpoints}
          data-testid="responsive-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveAttribute('data-columns-count', '2');

      // Simulate resize to larger viewport
      await act(async () => {
        setWindowWidth(800);
        fireEvent(window, new Event('resize'));
      });

      expect(container).toHaveAttribute('data-columns-count', '4');
    });

    it('should not re-render if column count stays the same', async () => {
      setWindowWidth(400);

      render(
        <ResponsiveMasonry
          columnsCountBreakPoints={breakpoints}
          data-testid="responsive-masonry"
        >
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      expect(container).toHaveAttribute('data-columns-count', '2');

      // Simulate resize within same breakpoint range
      await act(async () => {
        setWindowWidth(450);
        fireEvent(window, new Event('resize'));
      });

      // Should still be 2 columns
      expect(container).toHaveAttribute('data-columns-count', '2');
    });
  });

  describe('Render prop support', () => {
    const breakpoints: ColumnsCountBreakPoints = {
      400: 2,
      800: 4,
    };

    it('should call render prop with current column count', () => {
      setWindowWidth(500);

      const renderFn = jest.fn((columnsCount: number) => (
        <div data-testid="content">Columns: {columnsCount}</div>
      ));

      render(
        <ResponsiveMasonry columnsCountBreakPoints={breakpoints}>
          {renderFn}
        </ResponsiveMasonry>
      );

      expect(renderFn).toHaveBeenCalledWith(2);
      expect(screen.getByTestId('content')).toHaveTextContent('Columns: 2');
    });

    it('should update render prop on resize', async () => {
      setWindowWidth(500);

      const renderFn = jest.fn((columnsCount: number) => (
        <div data-testid="content">Columns: {columnsCount}</div>
      ));

      render(
        <ResponsiveMasonry columnsCountBreakPoints={breakpoints}>
          {renderFn}
        </ResponsiveMasonry>
      );

      expect(screen.getByTestId('content')).toHaveTextContent('Columns: 2');

      // Simulate resize
      await act(async () => {
        setWindowWidth(1000);
        fireEvent(window, new Event('resize'));
      });

      expect(screen.getByTestId('content')).toHaveTextContent('Columns: 4');
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ResponsiveMasonry>
          <div>Child</div>
        </ResponsiveMasonry>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Default breakpoints', () => {
    it('should use default breakpoints when none provided', () => {
      setWindowWidth(800);

      render(
        <ResponsiveMasonry data-testid="responsive-masonry">
          <div>Child</div>
        </ResponsiveMasonry>
      );

      const container = screen.getByTestId('responsive-masonry');
      // Default breakpoints: { 350: 1, 750: 2, 900: 3 }
      // At 800px, should be 2 columns
      expect(container).toHaveAttribute('data-columns-count', '2');
    });
  });
});
