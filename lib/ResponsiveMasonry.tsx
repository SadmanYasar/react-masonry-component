import React, {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  HTMLAttributes,
} from 'react';

/**
 * Breakpoint configuration for responsive columns.
 * Keys are minimum viewport widths in pixels, values are column counts.
 * Example: { 300: 2, 500: 3, 700: 5, 900: 6 }
 */
export interface ColumnsCountBreakPoints {
  [breakpoint: number]: number;
}

/**
 * Props for the ResponsiveMasonry component
 */
export interface ResponsiveMasonryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Breakpoint configuration for responsive columns.
   * Keys are minimum viewport widths in pixels, values are column counts.
   * The component will use the column count for the largest matching breakpoint.
   * @default { 350: 1, 750: 2, 900: 3 }
   */
  columnsCountBreakPoints?: ColumnsCountBreakPoints;
  /**
   * Children to render within the responsive container.
   * Typically a Masonry component that receives the columnsCount from context or as a render prop.
   */
  children: ReactNode | ((columnsCount: number) => ReactNode);
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Determines the number of columns based on viewport width and breakpoints.
 * Uses the largest breakpoint that is <= viewport width.
 */
function getColumnsCount(
  width: number,
  breakPoints: ColumnsCountBreakPoints
): number {
  const breakPointsArray = Object.keys(breakPoints)
    .map(Number)
    .sort((a, b) => a - b);

  let columns = 1;

  for (const breakPoint of breakPointsArray) {
    if (breakPoint <= width) {
      columns = breakPoints[breakPoint];
    } else {
      break;
    }
  }

  return columns;
}

const DEFAULT_BREAKPOINTS: ColumnsCountBreakPoints = {
  350: 1,
  750: 2,
  900: 3,
};

/**
 * ResponsiveMasonry - A Higher Order Component that provides responsive column counts
 * based on viewport width breakpoints.
 *
 * @example
 * ```tsx
 * <ResponsiveMasonry columnsCountBreakPoints={{ 300: 2, 500: 3, 700: 5, 900: 6 }}>
 *   {(columnsCount) => (
 *     <Masonry options={{ columnWidth: 100 / columnsCount + '%' }}>
 *       {items.map((item) => <div key={item.id}>{item.content}</div>)}
 *     </Masonry>
 *   )}
 * </ResponsiveMasonry>
 * ```
 *
 * @example
 * ```tsx
 * // Without render prop - children are rendered as-is
 * <ResponsiveMasonry columnsCountBreakPoints={{ 300: 2, 500: 3 }} className="p-5">
 *   <Masonry>
 *     {items.map((item) => <div key={item.id}>{item.content}</div>)}
 *   </Masonry>
 * </ResponsiveMasonry>
 * ```
 */
function ResponsiveMasonry({
  columnsCountBreakPoints = DEFAULT_BREAKPOINTS,
  children,
  ...restProps
}: ResponsiveMasonryProps): React.ReactElement {
  const [columnsCount, setColumnsCount] = useState<number>(() => {
    if (!isBrowser) {
      // Default to the largest breakpoint value for SSR
      const values = Object.values(columnsCountBreakPoints);
      return values.length > 0 ? Math.max(...values) : 1;
    }
    return getColumnsCount(window.innerWidth, columnsCountBreakPoints);
  });

  const handleResize = useCallback(() => {
    if (!isBrowser) return;
    const newColumnsCount = getColumnsCount(window.innerWidth, columnsCountBreakPoints);
    setColumnsCount((prev) => {
      if (prev !== newColumnsCount) {
        return newColumnsCount;
      }
      return prev;
    });
  }, [columnsCountBreakPoints]);

  useEffect(() => {
    if (!isBrowser) return;

    // Set initial value
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Render children - support both render prop and regular children
  const content = typeof children === 'function' ? children(columnsCount) : children;

  return (
    <div data-columns-count={columnsCount} {...restProps}>
      {content}
    </div>
  );
}

ResponsiveMasonry.displayName = 'ResponsiveMasonry';

export default ResponsiveMasonry;
export { ResponsiveMasonry };
