/**
 * @jest-environment node
 */
import React from 'react';
import { renderToString } from 'react-dom/server';

describe('SSR Compatibility', () => {
  describe('MasonryComponent', () => {
    it('should render without errors in Node.js environment', () => {
      // Dynamic import to ensure proper module isolation
      const { default: MasonryComponent } = require('../lib/index');

      // Should not throw when rendering to string
      expect(() => {
        const html = renderToString(
          React.createElement(
            MasonryComponent,
            { className: 'test-masonry' },
            React.createElement('div', { key: '1' }, 'Item 1'),
            React.createElement('div', { key: '2' }, 'Item 2')
          )
        );
        expect(html).toContain('test-masonry');
        expect(html).toContain('Item 1');
        expect(html).toContain('Item 2');
      }).not.toThrow();
    });

    it('should render container element in SSR', () => {
      const { default: MasonryComponent } = require('../lib/index');

      const html = renderToString(
        React.createElement(
          MasonryComponent,
          { 
            className: 'my-gallery',
            elementType: 'ul',
            'data-testid': 'masonry-ssr'
          },
          React.createElement('li', { key: '1' }, 'Item 1')
        )
      );

      expect(html).toContain('<ul');
      expect(html).toContain('class="my-gallery"');
      expect(html).toContain('data-testid="masonry-ssr"');
    });

    it('should handle all masonry props without errors in SSR', () => {
      const { default: MasonryComponent } = require('../lib/index');

      const masonryOptions = {
        columnWidth: 200,
        gutter: 10,
        transitionDuration: 0,
      };

      const imagesLoadedOptions = {
        background: '.image-bg',
      };

      expect(() => {
        renderToString(
          React.createElement(
            MasonryComponent,
            {
              className: 'gallery',
              elementType: 'section',
              options: masonryOptions,
              imagesLoadedOptions: imagesLoadedOptions,
              disableImagesLoaded: false,
              updateOnEachImageLoad: true,
              enableResizableChildren: true,
              onLayoutComplete: () => {},
              onRemoveComplete: () => {},
              onImagesLoaded: () => {},
            },
            React.createElement('div', { key: '1' }, 'Content')
          )
        );
      }).not.toThrow();
    });
  });

  describe('ResponsiveMasonry', () => {
    it('should render without errors in Node.js environment', () => {
      const { ResponsiveMasonry } = require('../lib/index');

      expect(() => {
        const html = renderToString(
          React.createElement(
            ResponsiveMasonry,
            { 
              className: 'responsive-container',
              columnsCountBreakPoints: { 300: 2, 500: 3 }
            },
            React.createElement('div', null, 'Content')
          )
        );
        expect(html).toContain('responsive-container');
        expect(html).toContain('Content');
      }).not.toThrow();
    });

    it('should use largest breakpoint value for initial SSR render', () => {
      const { ResponsiveMasonry } = require('../lib/index');

      const html = renderToString(
        React.createElement(
          ResponsiveMasonry,
          {
            columnsCountBreakPoints: { 300: 2, 500: 3, 700: 5 },
          },
          React.createElement('div', null, 'Content')
        )
      );

      // Should use max columns (5) as fallback during SSR
      expect(html).toContain('data-columns-count="5"');
    });

    it('should render with render prop function in SSR', () => {
      const { ResponsiveMasonry } = require('../lib/index');

      const html = renderToString(
        React.createElement(
          ResponsiveMasonry,
          {
            columnsCountBreakPoints: { 400: 2, 800: 4 },
          },
          (columnsCount: number) => 
            React.createElement('div', null, `Columns: ${columnsCount}`)
        )
      );

      // Should render with max value (4) during SSR
      expect(html).toContain('Columns: 4');
    });
  });

  describe('Combined usage', () => {
    it('should render ResponsiveMasonry with Masonry child in SSR', () => {
      const { default: MasonryComponent, ResponsiveMasonry } = require('../lib/index');

      expect(() => {
        const html = renderToString(
          React.createElement(
            ResponsiveMasonry,
            {
              columnsCountBreakPoints: { 300: 2, 500: 3 },
              className: 'responsive-wrapper',
            },
            React.createElement(
              MasonryComponent,
              { 
                className: 'masonry-grid',
                options: { columnWidth: 200 }
              },
              React.createElement('div', { key: '1' }, 'Item 1'),
              React.createElement('div', { key: '2' }, 'Item 2')
            )
          )
        );

        expect(html).toContain('responsive-wrapper');
        expect(html).toContain('masonry-grid');
        expect(html).toContain('Item 1');
        expect(html).toContain('Item 2');
      }).not.toThrow();
    });
  });
});
